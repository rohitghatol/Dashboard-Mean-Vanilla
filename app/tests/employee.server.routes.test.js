'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Employee = mongoose.model('Employee'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, employee;

/**
 * Employee routes tests
 */
describe('Employee CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Employee
		user.save(function() {
			employee = {
				name: 'Employee Name'
			};

			done();
		});
	});

	it('should be able to save Employee instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Employee
				agent.post('/employees')
					.send(employee)
					.expect(200)
					.end(function(employeeSaveErr, employeeSaveRes) {
						// Handle Employee save error
						if (employeeSaveErr) done(employeeSaveErr);

						// Get a list of Employees
						agent.get('/employees')
							.end(function(employeesGetErr, employeesGetRes) {
								// Handle Employee save error
								if (employeesGetErr) done(employeesGetErr);

								// Get Employees list
								var employees = employeesGetRes.body;

								// Set assertions
								(employees[0].user._id).should.equal(userId);
								(employees[0].name).should.match('Employee Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Employee instance if not logged in', function(done) {
		agent.post('/employees')
			.send(employee)
			.expect(401)
			.end(function(employeeSaveErr, employeeSaveRes) {
				// Call the assertion callback
				done(employeeSaveErr);
			});
	});

	it('should not be able to save Employee instance if no name is provided', function(done) {
		// Invalidate name field
		employee.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Employee
				agent.post('/employees')
					.send(employee)
					.expect(400)
					.end(function(employeeSaveErr, employeeSaveRes) {
						// Set message assertion
						(employeeSaveRes.body.message).should.match('Please fill Employee name');
						
						// Handle Employee save error
						done(employeeSaveErr);
					});
			});
	});

	it('should be able to update Employee instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Employee
				agent.post('/employees')
					.send(employee)
					.expect(200)
					.end(function(employeeSaveErr, employeeSaveRes) {
						// Handle Employee save error
						if (employeeSaveErr) done(employeeSaveErr);

						// Update Employee name
						employee.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Employee
						agent.put('/employees/' + employeeSaveRes.body._id)
							.send(employee)
							.expect(200)
							.end(function(employeeUpdateErr, employeeUpdateRes) {
								// Handle Employee update error
								if (employeeUpdateErr) done(employeeUpdateErr);

								// Set assertions
								(employeeUpdateRes.body._id).should.equal(employeeSaveRes.body._id);
								(employeeUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Employees if not signed in', function(done) {
		// Create new Employee model instance
		var employeeObj = new Employee(employee);

		// Save the Employee
		employeeObj.save(function() {
			// Request Employees
			request(app).get('/employees')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Employee if not signed in', function(done) {
		// Create new Employee model instance
		var employeeObj = new Employee(employee);

		// Save the Employee
		employeeObj.save(function() {
			request(app).get('/employees/' + employeeObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', employee.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Employee instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Employee
				agent.post('/employees')
					.send(employee)
					.expect(200)
					.end(function(employeeSaveErr, employeeSaveRes) {
						// Handle Employee save error
						if (employeeSaveErr) done(employeeSaveErr);

						// Delete existing Employee
						agent.delete('/employees/' + employeeSaveRes.body._id)
							.send(employee)
							.expect(200)
							.end(function(employeeDeleteErr, employeeDeleteRes) {
								// Handle Employee error error
								if (employeeDeleteErr) done(employeeDeleteErr);

								// Set assertions
								(employeeDeleteRes.body._id).should.equal(employeeSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Employee instance if not signed in', function(done) {
		// Set Employee user 
		employee.user = user;

		// Create new Employee model instance
		var employeeObj = new Employee(employee);

		// Save the Employee
		employeeObj.save(function() {
			// Try deleting Employee
			request(app).delete('/employees/' + employeeObj._id)
			.expect(401)
			.end(function(employeeDeleteErr, employeeDeleteRes) {
				// Set message assertion
				(employeeDeleteRes.body.message).should.match('User is not logged in');

				// Handle Employee error error
				done(employeeDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Employee.remove().exec();
		done();
	});
});