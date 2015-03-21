var manage = (function() {
	var manage = angular.module("danmu.manage", [
		"ui.bootstrap",
		"manageControllers"
	]);
	var manageControllers = angular.module('manageControllers', []);
	var registerInit = []; // 用于初始化回调

	// alternatively, register the interceptor via an anonymous factory

	manage.config(['$httpProvider',
		function($httpProvider) {
			$httpProvider.interceptors.push(function($q, $rootScope) {
				return {
					'responseError': function(response) {
						$rootScope.err.code = response.status;
						$rootScope.err.desc = response.data.error;
						$rootScope.haveError = true;
						return $q.reject(response);
					},
					'response': function(response) {
						$rootScope.err.code = response.status;
						$rootScope.err.desc = "";
						$rootScope.haveError = false;
						return response;
					}
				};
			});
		}
	]);

	manageControllers.controller("MainCtrl",
		function($scope, $http, $rootScope) {
			$scope.accordion = {
				closeOther: false,
				openInfo: true,
				openDanmu: true,
				openBlock: true,
				openConfig: true,
				disableInfo: false
			};
			$scope.isLogin = false;
			$scope.room = "";
			$scope.password = "";
			$rootScope.haveError = false;
			$rootScope.err = {
				code: 200,
				desc: ""
			};

			$scope.initRoom = function(room) {
				$scope.room = room;
			};
			$scope.enterRoom = function(password) {
				$scope.password = password;
				for (var object in registerInit) registerInit[object].call();
				$scope.isLogin = true;
				$scope.accordion.openInfo = false;
			};
			$scope.buildParam = function(object) {
				object.room = $scope.room;
				object.password = $scope.password;
				return object;
			};
			$http.post("/manage/room/get/", $scope.buildParam({})).success(function(data, status, headers, config) {
				$scope.roomList = data;
			});
		}
	);
	manageControllers.controller("DanmuCtrl",
		function($scope, $http) {
			$scope.danmu = {};
			$scope.danmu.searchKey = "";
			$scope.danmu.doSearch = function() {
				$http.post("/manage/search", $scope.buildParam({
					key: $scope.danmu.searchKey,
				})).success(function(data, status, headers, config) {
					$scope.danmu.result = data;
				});
			};
		}
	);
	manageControllers.controller("BlockCtrl",
		function($scope, $http) {
			$scope.block = {};
			$scope.block.textUser = "";
			$scope.block.doAdd = function() {
				$http.post("/manage/block/add", $scope.buildParam({
					user: $scope.block.textUser,
				})).success(function(data, status, headers, config) {
					$scope.block.result.push($scope.block.textUser);
					$scope.block.textUser = "";
				});
			};
			$scope.block.checkKeyDown = function(e) {
				if (e.keyCode == 13) this.doAdd();
			};
			$scope.block.doRemove = function(user) {
				$http.post("/manage/block/remove", $scope.buildParam({
					user: user,
				})).success(function(data, status, headers, config) {
					$scope.block.result.splice($scope.block.result.indexOf(user), 1);
				});
			};
			registerInit.push(function() {
				$http.post("/manage/block/get/", $scope.buildParam({})).success(function(data, status, headers, config) {
					$scope.block.result = data;
				});
			});
		}
	);
	manageControllers.controller("ConfigCtrl",
		function($scope, $http) {
			$scope.config = {};
			$scope.config.realConfig = {};
			$scope.config.realConfig.replaceKeyword = "";
			$scope.config.realConfig.blockKeyword = "";
			$scope.config.realConfig.socketinterval = 0;
			$scope.config.realConfig.socketsingle = 0;
			$scope.config.realConfig.maxlength = 0;
			$scope.config.submitConfig = function() {
				try {
					var regEx1 = new RegExp($scope.config.realConfig.replaceKeyword);
					var regEx2 = new RegExp($scope.config.realConfig.blockKeyword);
					$http.post("/manage/config/set/", $scope.buildParam($scope.config.realConfig)).success(function(data, status, headers, config) {
						$scope.config.realConfig = data;
					});
				} catch (e) {
					alert("正则检测出错！\n\n" + e.toString());
				}

			};
			registerInit.push(function() {
				$http.post("/manage/config/get/", $scope.buildParam({})).success(function(data, status, headers, config) {
					$scope.config.realConfig = data;
				});
			});

		}
	);
	return manage;
})();