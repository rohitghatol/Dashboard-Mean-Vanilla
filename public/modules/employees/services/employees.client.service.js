'use strict';

//Employees service used to communicate Employees REST endpoints
angular.module('employees').factory('Employees', ['$resource',
	function($resource) {
		return $resource('employees/:employeeId', { employeeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);