'use strict';

// Configuring the Articles module
angular.module('employees').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Employees', 'employees', 'dropdown', '/employees(/create)?');
		Menus.addSubMenuItem('topbar', 'employees', 'List Employees', 'employees');
		Menus.addSubMenuItem('topbar', 'employees', 'New Employee', 'employees/create');
	}
]);