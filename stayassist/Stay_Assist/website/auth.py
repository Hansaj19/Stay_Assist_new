from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
from . import db, login_manager  # Import from package level
from .models import User, ServiceRequest

auth = Blueprint('auth', __name__)



# User loader must be defined at module level
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@auth.route('/signup', methods=['GET', 'POST'])
def sign_up():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        phone_number = request.form.get('phone_number')
        hostel = request.form.get('hostel')
        block = request.form.get('block')
        room_number = request.form.get('room_number')

        user = User.query.filter_by(email=email).first()
        if user:
            flash('Email already exists.', category='error')
        else:
            new_user = User(
                email=email,
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number,
                hostel=hostel,
                block=block,
                room_number=room_number
            )
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user)
            flash('Account created successfully!', category='success')
            return redirect(url_for('auth.features'))

    return render_template('sign_up.html')

@auth.route('/signin', methods=['GET', 'POST'])
def sign_in():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            flash('Logged in successfully!', category='success')
            return redirect(url_for('auth.features'))

        flash('Invalid email or password.', category='error')

    return render_template('sign_in.html')

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.sign_in'))

@auth.route('/features')
@login_required
def features():
    return render_template('features.html')

@auth.route('/book-service', methods=['POST'])
@login_required
def submit_service_request():
    try:
        data = request.get_json()
        
        if not data or 'service' not in data:
            return jsonify({"error": "Invalid request data"}), 400

        # Create new service request
        new_request = ServiceRequest(
            user_id=current_user.id,
            service_type=data['service'],
            issue_description=data.get('issue', ''),
            date=datetime.strptime(data.get('date'), '%Y-%m-%dT%H:%M'),
            status='pending'
        )

        # Prepare service-specific data
        service_data = {}
        if data['service'] == 'cleaning':
            service_data = {'frequency': data.get('frequency', 'once')}
        elif data['service'] == 'pest':
            service_data = {'pest_type': data.get('pest_type', 'unknown')}
        elif data['service'] == 'ac':
            service_data = {'service_type': data.get('service_type', 'general')}
        elif data['service'] == 'furniture':
            service_data = {'furniture_type': data.get('furniture_type', 'other')}

        new_request.set_service_data(service_data)
        
        db.session.add(new_request)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Request submitted successfully!",
            "request_id": new_request.id,
            "redirect_url": url_for('auth.booking_confirmation', request_id=new_request.id)
        })

    except ValueError as e:
        return jsonify({"error": "Invalid date format"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth.route('/booking-confirmation/<int:request_id>')
@login_required
def booking_confirmation(request_id):
    # Verify the request belongs to the current user
    service_request = ServiceRequest.query.filter_by(
        id=request_id,
        user_id=current_user.id
    ).first_or_404()

    # Prepare data for template
    confirmation_data = {
        'service_type': service_request.service_type,
        'request_id': service_request.id,
        'issue': service_request.issue_description,
        'scheduled_date': service_request.date,
        'status': service_request.status,
        'user': current_user
    }

    # Add service-specific data
    service_data = service_request.get_service_data()
    if service_request.service_type == 'cleaning':
        confirmation_data['frequency'] = service_data.get('frequency')
    elif service_request.service_type == 'pest':
        confirmation_data['pest_type'] = service_data.get('pest_type')
    elif service_request.service_type == 'ac':
        confirmation_data['service_type'] = service_data.get('service_type')
    elif service_request.service_type == 'furniture':
        confirmation_data['furniture_type'] = service_data.get('furniture_type')

    return render_template('book_service.html', **confirmation_data)

@auth.route('/service-requests', methods=['GET'])
@login_required
def get_service_requests():
    service_type = request.args.get('service')
    
    query = ServiceRequest.query.filter_by(user_id=current_user.id)
    
    if service_type:
        query = query.filter_by(service_type=service_type)
    
    requests = query.order_by(ServiceRequest.date.desc()).all()
    
    requests_data = []
    for req in requests:
        request_data = {
            "id": req.id,
            "service_type": req.service_type,
            "issue": req.issue_description,
            "date": req.date.isoformat(),
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else None
        }
        
        # Add service-specific fields
        service_data = req.get_service_data()
        if req.service_type == 'cleaning':
            request_data['frequency'] = service_data.get('frequency')
        elif req.service_type == 'pest':
            request_data['pest_type'] = service_data.get('pest_type')
        elif req.service_type == 'ac':
            request_data['service_type'] = service_data.get('service_type')
        elif req.service_type == 'furniture':
            request_data['furniture_type'] = service_data.get('furniture_type')
        
        requests_data.append(request_data)
    
    return jsonify(requests_data)

@auth.route('/user-dashboard')
@login_required
def user_dashboard():
    # Get all service requests for the user, newest first
    all_requests = ServiceRequest.query.filter_by(
        user_id=current_user.id
    ).order_by(ServiceRequest.date.desc()).all()
    
    # Organize by status
    pending_requests = [r for r in all_requests if r.status == 'pending']
    confirmed_requests = [r for r in all_requests if r.status == 'confirmed']
    completed_requests = [r for r in all_requests if r.status == 'completed']
    
    return render_template('user_dashboard.html',
                         user=current_user,
                         pending_requests=pending_requests,
                         confirmed_requests=confirmed_requests,
                         completed_requests=completed_requests)