define(['jquery', 'jqxwidgets', 'underscore',
    'robot', 'field', 'fieldobstacle',
    'sensors/rangefinder', 'sensors/gyro',
    'simulation', 'ast/parser', 'samples'],
function($, jqxWidgets, _, Robot, Field, FieldObstacle,
    RangeFinder, Gyro,
    Simulation, Parser, Samples) {

    var mouseDown = false;
    var vMouseDown = false;
    var lastX;
    var lastY;

    function _generateSensorLabel(sensorEntry) {
        var positionString;
        switch (sensorEntry.position) {
            case Robot.SensorMountPoint.FRONT:
                positionString = 'FRONT';
                break;
            case Robot.SensorMountPoint.BACK:
                positionString = 'BACK';
                break;
            case Robot.SensorMountPoint.RIGHT:
                positionString = 'RIGHT';
                break;
            case Robot.SensorMountPoint.LEFT:
                positionString = 'LEFT';
                break;
            default:
                positionString = 'CHASSIS';
        }

        var label = sensorEntry.type + ', Position: ' + positionString + ', Accessor: Robot.' + sensorEntry.name;
        sensorEntry.label = label;
        sensorEntry.value = sensorEntry.name;
    }

    function _sensorExists(sensorName, sensorList) {
        for (var i = 0, len = sensorList.length; i < len; i++) {
            var sensorItem = sensorList[i];
            if (sensorItem.name === sensorName) {
                return true;
            }
        }
        return false;
    }

    function _generateNetworkTableView(networkTable) {
        var retArray = [];
        for (var key in networkTable) {
            retArray.push({
                fieldName: key,
                fieldValue: networkTable[key]
            });
        }

        return retArray;
    }

    return {
        start: function() {

            //Setup entries
            var txtFieldWidth = document.getElementById('txtFieldWidth');
            var txtFieldHeight = document.getElementById('txtFieldHeight');
            var btnUpdateField = document.getElementById('btnUpdateField');

            var txtSensorName = document.getElementById('txtSensorName');
            var cboSensorType = document.getElementById('cboSensorType');
            var cboSensorPosition = document.getElementById('cboSensorPosition');
            var btnAddSensor = document.getElementById('btnAddSensor');
            var btnDeleteSensor = document.getElementById('btnDeleteSensor');

            var compilerOutput = document.getElementById('compilerOutput');
            //end setup

            //"Model"
            var fieldSize = {
                width: 54,
                height: 24
            };

            var sensors = [
                {
                    type: 'RangeFinder',
                    position: Robot.SensorMountPoint.FRONT,
                    name: 'rangeFinder',
                },
                {
                    type: 'Gyro',
                    position: Robot.SensorMountPoint.CHASSIS,
                    name: 'gyro',
                }
            ];

            for (var i = 0, len = sensors.length; i < len; i++) {
                var sensor = sensors[i];
                _generateSensorLabel(sensor);
            }

            //hash table of network table values
            var networkTableValues = {};

            //The data adapter for network tables
            var networkTableDataSource = {
                localdata: [],
                dataType: 'array',
                dataFields: [
                    {name: 'fieldName', type: 'string'},
                    {name: 'fieldValue', type: 'string'}
                ]
            }
            var networkTableDataAdapter = new $.jqx.dataAdapter(networkTableDataSource);
            //End "Model"

            //UI Initialization routines
            txtFieldWidth.value = fieldSize.width;
            txtFieldHeight.value = fieldSize.height;
            //End UI Init


            var isRunning = false;
            var timerToken;

            var errorLine = null;
            var EditorRange = ace.require('ace/range').Range;

            var robot = new Robot({width: 5, height: 10});

            _resetRobot();

            var theField = new Field(document.getElementById('playingField'), fieldSize);

            robot.addEventHandler('collision', function() {
                console.log('Robot had a collision!');
            });

            //Resize event handler
            window.addEventListener('resize', _.debounce(function() {
                //force a reset of the dimensions
                theField.forceRedraw();
            }, 100));

            //Code Editor
            //Trigger the extension
            ace.require('ace/ext/language_tools');
            var editor = ace.edit("editorArea");
            //editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode("ace/mode/c_cpp");
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
            });

            //Load any samples
            var sampleList = document.getElementById('cboSamples');
            var samples = Samples.sampleList;
            /*for (var i = 0, len = samples.length; i < len; i++) {
                var sample = samples[i];
                var opt = document.createElement('option');
                opt.value = i;
                opt.innerText = sample.title;
                sampleList.appendChild(opt);
            }*/

            var loadSampleBtn = document.getElementById('btnLoadSample');
            loadSampleBtn.addEventListener('click', function() {
                //var idx = sampleList.selectedIndex;
                //if (idx !== -1) {
                    editor.getSession().setValue(samples[0].code);
                //}
            });

            //Load any fields
            var fieldTypes = document.getElementById('fieldTypes');
            var fields = Field.FieldNames;
            for (var i = 0, len = fields.length; i < len; i++) {
                var field = fields[i];
                var opt = document.createElement('option');
                opt.value = field.value;
                opt.innerText = field.name;
                fieldTypes.appendChild(opt);
            }

            var fieldTypeDropDown = document.getElementById('fieldTypes');
            fieldTypeDropDown.addEventListener('change', function() {
                theField.setField(parseInt(this.value));
                _resetField();
            });

            var obstacleCnt = document.getElementById('numOfObstacles');
            obstacleCnt.addEventListener('change', function() {
                console.log("OBSATCLE EVENT");
                _resetField();
            });

            //UI
            $('#mainSplitter').jqxSplitter( { height: '100%', width: '100%', orientation: 'vertical', panels: [{size: '50%'}, {size:'50%'}]});
            $('#outputSplitter').jqxSplitter({height: '100%', width: '100%', orientation: 'horizontal', panels: [{size: '50%'}, {size: '50%'}]});

            $('#mainSplitter').on('resize', function() {
                theField.forceRedraw();
                editor.resize();
            });

            //set up the tabs in the UI
            $('#mainTabs').jqxTabs({width: '100%', height: '100%', position:'top'});
            $('#outputTabs').jqxTabs({width: '100%', height: '100%', position: 'top'});

            $('#sensorList').jqxListBox({source: sensors, width: '100%', height: 200});


            $('#addSensorPanel').jqxExpander({width: '100%', expanded: false});

            //set up the data table
            $('#networkTable').jqxDataTable({
                source: networkTableDataAdapter,
                width: '100%',
                columnsResize: true,
                columns: [
                    {text: 'Field', dataField: 'fieldName', width: 100},
                    {text: 'Value', dataField: 'fieldValue'}
                ]
            });

            var boundingBoxCheckbox = document.getElementById('chkBoundingBox');
            boundingBoxCheckbox.addEventListener('change', function() {
                robot.showBoundingBox = boundingBoxCheckbox.checked;
            });

            btnUpdateField.addEventListener('click', function() {
                var tempWidth = parseInt(txtFieldWidth.value);
                var tempHeight = parseInt(txtFieldHeight.value);

                if (!isNaN(tempWidth) && !isNaN(tempHeight)) {
                    fieldSize.width = tempWidth;
                    fieldSize.height = tempHeight;
                }
                else {
                    txtFieldWidth.value = fieldSize.width;
                    txtFieldHeight.value = fieldSize.height;
                }

                theField.dimensions = fieldSize;
            });


            //Main App initialization
            theField.addItem(robot, theField.FieldItemType.ROBOT);

            //Hook up the button listeners
            var startStopBtn = document.getElementById('btnStartStop');
            var compileBtn = document.getElementById('btnCompile');
            var resetButton = document.getElementById('btnReset');
            var clearOutputBtn = document.getElementById('btnClearOutput');

            startStopBtn.disabled = true;


            var outputList = document.getElementById('outputList');

            function printOutput(type, message) {
                if (type === 'COMPILE') {
                    compilerOutput.innerHTML += "[COMPILER] " + message + "\n";
                }
                else {
                    outputList.innerHTML += "[" + type + "] " + message + "\n";
                }
            }

            //Simulation Setup
            var simulation = new Simulation(theField, robot, sensors);

            simulation.addEventHandler('runStateChanged', function(isRunning) {
                if (isRunning) {
                    startStopBtn.textContent = "Stop";
                }
                else {
                    startStopBtn.textContent = "Start";
                }
            });

            simulation.addEventHandler('simulationComplete', function(e) {
                printOutput('SYS', "Simulation Complete: " + e.message);
                //disable the button
                startStopBtn.disabled = true;
            });

            simulation.addEventHandler('simulationError', function(e) {
                console.warn(e.message);
            });

            simulation.addEventHandler('simulationOutput', function(output) {
                if (output.type === 'output') {
                    printOutput("SIM", output.message);
                }
            });

            simulation.addEventHandler('networkTableValueUpdated', function(e) {
                networkTableValues[e.varName] = e.value;
                networkTableDataSource.localdata = _generateNetworkTableView(networkTableValues);
                networkTableDataAdapter.dataBind();
                $("#networkTable").jqxDataTable('updateBoundData');
            });

            startStopBtn.addEventListener('click', function() {
                if (simulation.isRunning) {
                    simulation.stop();
                    _enableControlArea();
                }
                else {
                    _disableControlArea();
                    
                    //reset the network tables
                    networkTableValues = {};
                    networkTableDataSource.localdata = _generateNetworkTableView(networkTableValues);
                    networkTableDataAdapter.dataBind();
                    $("#networkTable").jqxDataTable('updateBoundData');
                    simulation.start();
                    //switch to the console tab
                    $('#outputTabs').jqxTabs('select', 1);

                }
            });

            clearOutputBtn.addEventListener('click', function() {
                outputList.innerHTML = "";
            })

            var compilePass = false;
            var loaderArea = document.getElementById('loader');
            compileBtn.addEventListener('click', function() {
                editor.getSession().clearAnnotations();
                loaderArea.classList.add('loading');

                //Clear out the compiler messages first
                compilerOutput.innerHTML = '';

                //switch compiler to compiler tab
                $('#outputTabs').jqxTabs('select', 0);

                printOutput("COMPILE", "Beginning Compilation...");

                if (errorLine !== null) {
                    editor.getSession().removeMarker(errorLine);
                    errorLine = null;
                }
                window.setTimeout(function() {
                    try {
                        _resetRobot();
                        var result = Parser.parse(editor.getSession().getValue());

                        simulation.loadProgramAST(result);
                        startStopBtn.disabled = false;
                        compilePass = true;
                        loaderArea.classList.remove('loading');
                        printOutput("COMPILE", "Compilation Complete");
                    }
                    catch (e) {
                        if (e instanceof ReferenceError || e instanceof TypeError) {
                            throw e;
                        }
                        startStopBtn.disabled = true;
                        compilePass = false;

                        //Do error highlighting
                        var line, col;
                        if (e.line && e.column) {
                            line = e.line;
                            col = e.column;
                        }
                        else if (e.loc) {
                            line = e.loc.line;
                            col = e.loc.column;
                        }
                        if (line !== undefined && col !== undefined) {
                            editor.getSession().setAnnotations([{
                                row: line - 1,
                                column: col,
                                text: e.message,
                                type: 'error'
                            }]);

                            errorLine = editor.getSession().addMarker(new EditorRange(line - 1, 0, line, 0), "error", "line");
                        }
                        loaderArea.classList.remove('loading');
                        printOutput("COMPILE", e.message);
                    }
                }, 0);
            });

            resetButton.addEventListener('click', function () {
                _resetRobot();
                if (simulation) {
                    simulation.reset();
                    if(compilePass) {
                        startStopBtn.disabled = false;
                    }
                }
            });

            btnAddSensor.addEventListener('click', function() {
                var selSensorType = cboSensorType.options.item(cboSensorType.selectedIndex);
                var selSensorPosition = cboSensorPosition.options.item(cboSensorPosition.selectedIndex);

                var sensorName = txtSensorName.value.trim();
                if (sensorName.length === 0) {
                    alert('Sensor name cannot be empty');
                    return;
                }
                else {
                    if (_sensorExists(sensorName, sensors)) {
                        alert('Sensor name already exists');
                        return;
                    }
                    var sensorObj = {
                        type: selSensorType.value,
                        position: parseInt(selSensorPosition.value),
                        name: sensorName
                    };
                    _generateSensorLabel(sensorObj);
                    sensors.push(sensorObj);
                    $('#sensorList').jqxListBox('refresh', true);
                    simulation.updateRobotSensors(sensors);
                }
            });

            btnDeleteSensor.addEventListener('click', function() {
                var selIndex = $('#sensorList').jqxListBox('getSelectedIndex');
                console.log('selectedIndex: ', selIndex);
                if (selIndex !== -1) {
                    sensors.splice(selIndex, 1);
                    $('#sensorList').jqxListBox('refresh', true);
                    simulation.updateRobotSensors(sensors);
                }
            });

            function _resetRobot() {
                robot.setPositionXY(20, 10);
                robot.speed = 0;
                robot.rotationalSpeed = 0;
                robot.bearing = 0;
                robot.resetSensors();
            }

            function _resetField() {
                theField.resetFieldItems();

                // as long as the robot is the only item on the field, re-populate the obstacles
                if(theField.getFieldItemsSize() === 1)
                {
                     //==== Add some random obstacles ===
                    //this could be exported to its own function
                    //could replace these "boxes" with imgs
                    //warning: magic numbers in use
                    var numOfRndObstacles = document.getElementById('numOfObstacles').value;
                    if(numOfRndObstacles === "" || isNaN(numOfRndObstacles)  || 
                        numOfRndObstacles < theField.Obstacles.MIN || numOfRndObstacles > theField.Obstacles.MAX)
                    {
                        numOfRndObstacles = theField.Obstacles.MIN; 
                    }

                    var fieldId = parseInt(fieldTypeDropDown.value);
                    for(var i = 0; i < numOfRndObstacles; i++) {
                        var x = Math.floor(Math.random() * 50) + 2;  
                        var y = Math.floor(Math.random() * 20) + 2;

                        // don't draw to close to the robot
                        if(Math.abs(x-robot.position.x) <= 2 && Math.abs(y-robot.position.y) <= 2)
                        {
                            console.log("continue");
                            continue;
                        }  

                        var obstacle1 = new FieldObstacle( {x: x, y: y},
                            { 
                                width: FieldObstacle.ObstacleSize.WIDTH, 
                                height: FieldObstacle.ObstacleSize.HEIGHT
                            }, 
                            0, fieldId, (fieldId === -1) 
                        );

                        theField.addItem(obstacle1, theField.FieldItemType.OBSTACLE);
                    }
                        
                     //TODO change the owners of these methods / logic for refreshing pre-loading of obstacles for robot
                     robot.refreshObstacles();
                     robot.getSensor(0).refreshObstacles();
                
                    //==== End obstacles ====
                }              
            }

            function _enableControlArea() {
                compileBtn.disabled = 
                resetButton.disabled =
                loadSampleBtn.disabled = 
                fieldTypeDropDown.disabled = 
                obstacleCnt.disabled = false;
            }

            function _disableControlArea() {
                compileBtn.disabled = 
                resetButton.disabled =
                loadSampleBtn.disabled = 
                fieldTypeDropDown.disabled = 
                obstacleCnt.disabled = true;
            }

            theField.forceRedraw();
        }
    };
});
