define([],
function() {
	_DIST_INFINITY = 1000; // Set initial distances to infinity (any large number relative to field size)

	// First Quad  : 0   <= angleToUse < 90    where 0 is due North
	// Second Quad : 90  <= angleToUse < 180
	// Third Quad  : 180 <= angleToUse < 270
	// Fourth Quad : 270 <= angleToUse < 360
	// However angleRad is always an acute angle in all the following functions
	function _computeFirstQuadDistance(obstacleBBs, angleRad, sensorX, sensorY) {
		// y = -gradient * x + constant
		var gradient = 1/Math.tan(angleRad);
		var constant = sensorY + gradient * sensorX;
		console.log("First Quad equation: y = -" + gradient + "x + " + constant);

		var distance = _DIST_INFINITY;

		// Look for intersections with left and bottom sides of obstacles
		for (var i = 0, len = obstacleBBs.length; i < len; ++i) {
			var bb = obstacleBBs[i];
			console.log("Checking obstacle, minX = " + bb.minX + " maxY = " + bb.maxY);

			if (angleRad > 0 && bb.minX >= sensorX) {
				// Solve for intersection given an x, i.e. left side of obstacle
				// This is only possible if angleRad > 0
				var yPoint = -gradient * bb.minX + constant; 
				console.log("yPoint = " + yPoint);

				// Then check if this yPoint falls within the object boundary
				if (yPoint >= bb.minY && yPoint <= bb.maxY) {
					console.log("Point falls within left boundary");

					// Solve for distance
					var deltaX = Math.abs(bb.minX - sensorX);
					var deltaY = Math.abs(yPoint - sensorY);
					var newDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
					if (newDistance < distance) {
						distance = newDistance;
					}
				}
			}

			if (bb.maxY > sensorY) {
				continue;
			}

			// Solve for intersection given a y, i.e. bottom side of obstacle
			var xPoint = sensorX; // True for angleRad = 0
			if (angleRad > 0) {
				xPoint = -1 * (bb.maxY - constant) / gradient; 
			}
			console.log("xPoint = " + xPoint);

			// Then check if this xPoint falls within the object boundary
			if (xPoint >= bb.minX && xPoint <= bb.maxX) {
				console.log("Point falls within bottom boundary");

				// Solve for distance
				var deltaX = Math.abs(xPoint - sensorX);
				var deltaY = Math.abs(bb.maxY - sensorY);
				var newDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
				if (newDistance < distance) {
					distance = newDistance;
				}
			}
		}
		return distance; 
	}

	function _computeSecondQuadDistance(obstacleBBs, angleRad, sensorX, sensorY) {
		// y = gradient * x + constant
		var gradient = Math.tan(angleRad);
		var constant = sensorY - gradient * sensorX;
		console.log("Second Quad equation: y = " + gradient + "x + " + constant);

		var distance = _DIST_INFINITY;

		// Look for intersections with left and top sides of obstacles
		for (var i = 0, len = obstacleBBs.length; i < len; ++i) {
			var bb = obstacleBBs[i];
			console.log("Checking obstacle, minX = " + bb.minX + " minY = " + bb.minY);

			if (bb.minX >= sensorX) {
				// Solve for intersection given an x, i.e. left side of obstacle
				var yPoint = gradient * bb.minX + constant; 
				console.log("yPoint = " + yPoint);

				// Then check if this yPoint falls within the object boundary
				if (yPoint >= bb.minY && yPoint <= bb.maxY) {
					console.log("Point falls within left boundary");

					// Solve for distance
					var deltaX = Math.abs(bb.minX - sensorX);
					var deltaY = Math.abs(yPoint - sensorY);
					var newDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
					if (newDistance < distance) {
						distance = newDistance;
					}
				}
			}

			if (bb.minY < sensorY) {
				continue;
			}

			// Solve for intersection given a y, i.e. top side of obstacle
			var xPoint = (bb.minY - constant) / gradient;
			console.log("xPoint = " + xPoint);

			// Then check if this xPoint falls within the object boundary
			if (xPoint >= bb.minX && xPoint <= bb.maxX) {
				console.log("Point falls within top boundary");

				// Solve for distance
				var deltaX = Math.abs(xPoint - sensorX);
				var deltaY = Math.abs(bb.minY - sensorY);
				var newDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
				if (newDistance < distance) {
					distance = newDistance;
				}
			}
		}
		return distance; 
	}

	function _computeThirdQuadDistance(obstacleBBs, angleRad, sensorX, sensorY) {
		// y = -gradient * x + constant
		var gradient = 1/Math.tan(angleRad);
		var constant = sensorY + gradient * sensorX;
		console.log("Third Quad equation: y = -" + gradient + "x + " + constant);

		var distance = _DIST_INFINITY;

		// Look for intersections with right and top sides of obstacles
		for (var i = 0, len = obstacleBBs.length; i < len; ++i) {
			var bb = obstacleBBs[i];
			console.log("Checking obstacle, maxX = " + bb.maxX + " minY = " + bb.minY);

			if (angleRad > 0 && bb.maxX <= sensorX) {
				// Solve for intersection given an x, i.e. right side of obstacle
				// This is only possible if angleRad > 0
				var yPoint = -gradient * bb.maxX + constant; 
				console.log("yPoint = " + yPoint);

				// Then check if this yPoint falls within the object boundary
				if (yPoint >= bb.minY && yPoint <= bb.maxY) {
					console.log("Point falls within left boundary");

					// Solve for distance
					var deltaX = Math.abs(bb.maxX - sensorX);
					var deltaY = Math.abs(yPoint - sensorY);
					var newDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
					if (newDistance < distance) {
						distance = newDistance;
					}
				}
			}

			if (bb.minY < sensorY) {
				continue;
			}

			// Solve for intersection given a y, i.e. top side of obstacle
			var xPoint = sensorX; // True for angleRad = 0
			if (angleRad > 0) {
				xPoint = -1 * (bb.minY - constant) / gradient; 
			}
			console.log("xPoint = " + xPoint);

			// Then check if this xPoint falls within the object boundary
			if (xPoint >= bb.minX && xPoint <= bb.maxX) {
				console.log("Point falls within bottom boundary");

				// Solve for distance
				var deltaX = Math.abs(xPoint - sensorX);
				var deltaY = Math.abs(bb.minY - sensorY);
				var newDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
				if (newDistance < distance) {
					distance = newDistance;
				}
			}
		}
		return distance; 
	}

	function _computeFourthQuadDistance(obstacleBBs, angleRad, sensorX, sensorY) {
		// y = gradient * x + constant
		var gradient = Math.tan(angleRad);
		var constant = sensorY - gradient * sensorX;
		console.log("Fourth Quad equation: y = " + gradient + "x + " + constant);

		var distance = _DIST_INFINITY;

		// Look for intersections with right and bottom sides of obstacles
		for (var i = 0, len = obstacleBBs.length; i < len; ++i) {
			var bb = obstacleBBs[i];
			console.log("Checking obstacle, maxX = " + bb.maxX + " maxY = " + bb.maxY);

			if (bb.maxX <= sensorX) {
				// Solve for intersection given an x, i.e. right side of obstacle
				var yPoint = gradient * bb.maxX + constant; 
				console.log("yPoint = " + yPoint);

				// Then check if this yPoint falls within the object boundary
				if (yPoint >= bb.minY && yPoint <= bb.maxY) {
					console.log("Point falls within left boundary");

					// Solve for distance
					var deltaX = Math.abs(bb.maxX - sensorX);
					var deltaY = Math.abs(yPoint - sensorY);
					var newDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
					if (newDistance < distance) {
						distance = newDistance;
					}
				}
			}

			if (bb.maxY > sensorY) {
				continue;
			}

			// Solve for intersection given a y, i.e. bottom side of obstacle
			var xPoint = (bb.maxY - constant) / gradient;
			console.log("xPoint = " + xPoint);

			// Then check if this xPoint falls within the object boundary
			if (xPoint >= bb.minX && xPoint <= bb.maxX) {
				console.log("Point falls within top boundary");

				// Solve for distance
				var deltaX = Math.abs(xPoint - sensorX);
				var deltaY = Math.abs(bb.maxY - sensorY);
				var newDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
				if (newDistance < distance) {
					distance = newDistance;
				}
			}
		}
		return distance; 
	}
	
	/*
	All sensors MUST implement the following interface

	attachToRobot(robot)
	configure(<json object>) - configure the sensor (config details depend on sensor)
	getValue() - return a number representing whatever value the sensor is reporting
	getDescription() - return a description of the sensor
	reset() - resets the sensor

	*/
	function RangeFinder(minRange, maxRange) {

		var _robot;

		var _mountPoint;
		var _fieldDimensions;
		var _field;
                var _obstacleBoundingBoxes = [];

		//TODO we might want to do something with the range stuff
		var _minRange = 0;
		var _maxRange = 25;

		var _visualElem = document.createElement('div');
		_visualElem.classList.add('sim-sensor-line');
		_visualElem.style.webkitTransformOrigin = "bottom";

		var _showVisual = false;

		var _lastDistance = 0;

		this._redraw = function() {
			if(_mountPoint===undefined || !_robot) {
				console.warn('Sensor not configured.');
				return;
			}
			var width = _robot.domElement.clientWidth;
			var height = _robot.domElement.clientHeight;
			var xCord = 0;
			var yCord = height;
			var rotation = 0;

			if (_mountPoint == _robot.SensorMountPoint.RIGHT) {
				xCord += width;
				yCord -= height/2;
				rotation = 90;
			}
			else if (_mountPoint == _robot.SensorMountPoint.BACK) {
				xCord += width/2;
				yCord -= height;
				rotation = 180;
			}
			else if (_mountPoint == _robot.SensorMountPoint.LEFT) {
				yCord -= height/2;
				rotation = -90;
			} else {
				xCord += width/2;
			}

			_visualElem.style.bottom = yCord + 'px';
			_visualElem.style.left = xCord + 'px';
			_visualElem.style.webkitTransform = "rotate("+rotation+"deg)";
		}
		//Redraw visuals
		this.forceRedraw = function () {
			if(!_robot && !_showVisual) {
				return;
			}
			this._redraw();

		};

		//Interface requirements
		this.attachToRobot = function (robot) {
			_robot = robot;

			_robot.domElement.appendChild(_visualElem);
			this._redraw();
		};

		this.configure = function (config) {
			if (!_robot) {
				console.warn('Sensor not connected to robot');
				return;
			}
			if (config.fieldDimensions) {
				_fieldDimensions = config.fieldDimensions;
			}
			if (config.mountPoint) {
				_mountPoint = config.mountPoint;
				if (_mountPoint == _robot.SensorMountPoint.CHASSIS) {
					console.warn('Illegal mount point for RangeFinder. Adding to the front instead');
					_mountPoint = robot.SensorMountPoint.FRONT;
				}
			}
			if (config.playingField) {
				_field = config.playingField;
                                var fieldItems = _field.getFieldItems();
                                for (var i = 0, len = fieldItems.length; i < len; ++i) {
					if (_field.FieldItemType.OBSTACLE === fieldItems[i].type) {
						console.log("Adding obstacle bounding box");
						_obstacleBoundingBoxes.push(fieldItems[i].item.getBoundingBox());
					}
				}
			}

			if (config.showVisual !== undefined) {
				_showVisual = config.showVisual;
			}
		};

		this.getValue = function () {
			if (!_robot) {
				console.warn('Sensor not connected to robot');
				return parseFloat('NaN');
			}

			var pos = _robot.position;
			var size = _robot.size;
			var xCord = 0; // Regular cartesian with origin at bottom left
			var yCord = 0;
			var bearingRad = _robot.bearing/ 180 * Math.PI;
			var angleToUse = _robot.bearing;
			if (_mountPoint == _robot.SensorMountPoint.RIGHT) {
				angleToUse += 90;
				xCord += size.width;
			}
			else if (_mountPoint == _robot.SensorMountPoint.BACK) {
				angleToUse += 180;
				yCord -= size.height;
			}
			else if (_mountPoint == _robot.SensorMountPoint.LEFT) {
				angleToUse += 270;
				xCord -= size.width/2;
			} else {
				yCord += size.width/2;
			}

			if (angleToUse >= 360) {
				angleToUse -= 360;
			}

			console.log("Initial robot center: x = " + pos.x + " y = " + pos.y);
			// Perform clockwise rotation of sensor point around center of robot
			// Note: for actual field axes, y points downwards
			var deltaX = xCord * Math.cos(bearingRad) + yCord*Math.sin(bearingRad);
			var deltaY = - ( -xCord * Math.sin(bearingRad) + yCord*Math.cos(bearingRad) );

			// Now pos.x, pos.y describe the coordinates of the sensor point
			pos.x += deltaX;
			pos.y += deltaY;
			console.log("Final sensor point: x = " + pos.x + " y = " + pos.y);

			var angleRad;
			var offset;
			var distance = _DIST_INFINITY;

			//calculate the point at which we cross those borders
			console.log("angleToUse = " + angleToUse);
			if (angleToUse >= 0 && angleToUse < 90) {
				console.log("First quadrant");
				angleRad = angleToUse / 180 * Math.PI;

				distance = _computeFirstQuadDistance(_obstacleBoundingBoxes, angleRad, pos.x, pos.y);

				// Only check intersections with field boundary if no obstacle intersections are found
				if (_DIST_INFINITY === distance) {
					//Top-Right
					//Check the point crossing the top edge first
					offset = pos.y * Math.tan(angleRad);
					if (pos.x + offset <= _fieldDimensions.width) {
						//we are good
						var newDistance = pos.y / Math.cos(angleRad);
						if (newDistance < distance) {
							distance = newDistance;
						}
					}
					else {
						//check the point crossing the right edge
						offset = (_fieldDimensions.width - pos.x) / Math.tan(angleRad);
						var newDistance = (_fieldDimensions.width - pos.x) / Math.sin(angleRad);
						if (newDistance < distance) {
							distance = newDistance;
						}
					}
				}
			}
			else if (angleToUse >= 90 && angleToUse < 180) {
				//Bottom-Right
				console.log("Second quadrant");
				angleRad = (angleToUse - 90) / 180 * Math.PI;

				distance = _computeSecondQuadDistance(_obstacleBoundingBoxes, angleRad, pos.x, pos.y);

				// Only check intersections with field boundary if no obstacle intersections are found
				if (_DIST_INFINITY === distance) {
					//Check the point crossing the right edge first
					offset = (_fieldDimensions.width - pos.x) * Math.tan(angleRad);
					if (pos.y + offset <= _fieldDimensions.height) {
						var newDistance = (_fieldDimensions.width - pos.x) / Math.cos(angleRad);
						if (newDistance < distance) {
							distance = newDistance;
						}
					}
					else {
						//Cross bottom edge
						offset = (_fieldDimensions.height - pos.y) / Math.tan(angleRad);
						var newDistance = (_fieldDimensions.height - pos.y) / Math.sin(angleRad);
						if (newDistance < distance) {
							distance = newDistance;
						}
					}
				}
			}
			else if (angleToUse >= 180 && angleToUse < 270) {
				//Bottom-Left
				angleRad = (angleToUse - 180) / 180 * Math.PI;

				distance = _computeThirdQuadDistance(_obstacleBoundingBoxes, angleRad, pos.x, pos.y);

				// Only check intersections with field boundary if no obstacle intersections are found
				if (_DIST_INFINITY === distance) {
					//Check bottom crossing
					offset = (_fieldDimensions.height - pos.y) * Math.tan(angleRad);
					if (pos.x - offset >= 0) {
						var newDistance = (_fieldDimensions.height - pos.y) / Math.cos(angleRad);
						if (newDistance < distance) {
							distance = newDistance;
						}
					}
					else {
						var newDistance = pos.x / Math.sin(angleRad);
						if (newDistance < distance) {
							distance = newDistance;
						}
					}
				}
			}
			else {
				//Top-Left
				angleRad = (angleToUse - 270) / 180 * Math.PI;

				distance = _computeFourthQuadDistance(_obstacleBoundingBoxes, angleRad, pos.x, pos.y);

				// Only check intersections with field boundary if no obstacle intersections are found
				//Check left edge crossing
				if (_DIST_INFINITY === distance) {
					offset = pos.x * Math.tan(angleRad);
					if (offset <= pos.y) {
						var newDistance = pos.x / Math.cos(angleRad);
						if (newDistance < distance) {
							distance = newDistance;
						}
					}
					else {
						var newDistance = pos.y / Math.sin(angleRad);
						if (newDistance < distance) {
							distance = newDistance;
						}
					}
				}
			}

			if (distance) {
				if (_showVisual) {
					_visualElem.style.height = _field.logicalToPixelOffset(distance) + 'px';
				}

				_lastDistance = distance;
			}
			return distance;
		};

		this.getDescription = function() {
			return "Linear Rangefinder";
		};

		this.reset = function() {

		};
	}

	return RangeFinder;
});
