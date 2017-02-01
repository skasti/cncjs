import _ from 'lodash';
import classNames from 'classnames';
import colornames from 'colornames';
import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import { Dropdown, MenuItem } from 'react-bootstrap';
import Detector from 'three/examples/js/Detector';
import controller from '../../lib/controller';
import Interpolate from '../../components/Interpolate';
import i18n from '../../lib/i18n';
import {
    // Units
    IMPERIAL_UNITS,
    METRIC_UNITS,
    // Grbl
    GRBL,
    GRBL_ACTIVE_STATE_IDLE,
    GRBL_ACTIVE_STATE_RUN,
    GRBL_ACTIVE_STATE_HOLD,
    GRBL_ACTIVE_STATE_DOOR,
    GRBL_ACTIVE_STATE_HOME,
    GRBL_ACTIVE_STATE_SLEEP,
    GRBL_ACTIVE_STATE_ALARM,
    GRBL_ACTIVE_STATE_CHECK,
    // Smoothie
    SMOOTHIE,
    SMOOTHIE_ACTIVE_STATE_IDLE,
    SMOOTHIE_ACTIVE_STATE_RUN,
    SMOOTHIE_ACTIVE_STATE_HOLD,
    SMOOTHIE_ACTIVE_STATE_DOOR,
    SMOOTHIE_ACTIVE_STATE_HOME,
    SMOOTHIE_ACTIVE_STATE_SLEEP,
    SMOOTHIE_ACTIVE_STATE_ALARM,
    SMOOTHIE_ACTIVE_STATE_CHECK,
    // TinyG2
    TINYG2,
    TINYG2_MACHINE_STATE_INITIALIZING,
    TINYG2_MACHINE_STATE_READY,
    TINYG2_MACHINE_STATE_ALARM,
    TINYG2_MACHINE_STATE_STOP,
    TINYG2_MACHINE_STATE_END,
    TINYG2_MACHINE_STATE_RUN,
    TINYG2_MACHINE_STATE_HOLD,
    TINYG2_MACHINE_STATE_PROBE,
    TINYG2_MACHINE_STATE_CYCLE,
    TINYG2_MACHINE_STATE_HOMING,
    TINYG2_MACHINE_STATE_JOG,
    TINYG2_MACHINE_STATE_INTERLOCK,
    TINYG2_MACHINE_STATE_SHUTDOWN,
    TINYG2_MACHINE_STATE_PANIC,
    // Workflow
    WORKFLOW_STATE_IDLE
} from '../../constants';
import styles from './index.styl';

class Controls extends Component {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }
    canSendCommand() {
        const { state } = this.props;
        const { port, controller, workflowState } = state;

        if (!port) {
            return false;
        }
        if (!controller.type || !controller.state) {
            return false;
        }
        if (workflowState !== WORKFLOW_STATE_IDLE) {
            return false;
        }

        return true;
    }
    renderControllerType() {
        const { state } = this.props;
        const controllerType = state.controller.type;

        return (
            <div className={styles.controllerType}>
                {controllerType}
            </div>
        );
    }
    renderControllerState() {
        const { state } = this.props;
        const controllerType = state.controller.type;
        const controllerState = state.controller.state;
        let stateStyle = 'controller-state-default';
        let stateText = '';

        if (controllerType === GRBL) {
            const activeState = _.get(controllerState, 'status.activeState');

            stateStyle = {
                [GRBL_ACTIVE_STATE_IDLE]: 'controller-state-default',
                [GRBL_ACTIVE_STATE_RUN]: 'controller-state-primary',
                [GRBL_ACTIVE_STATE_HOLD]: 'controller-state-warning',
                [GRBL_ACTIVE_STATE_DOOR]: 'controller-state-warning',
                [GRBL_ACTIVE_STATE_HOME]: 'controller-state-primary',
                [GRBL_ACTIVE_STATE_SLEEP]: 'controller-state-success',
                [GRBL_ACTIVE_STATE_ALARM]: 'controller-state-danger',
                [GRBL_ACTIVE_STATE_CHECK]: 'controller-state-info'
            }[activeState];

            stateText = {
                [GRBL_ACTIVE_STATE_IDLE]: i18n.t('controller:Grbl.activeState.idle'),
                [GRBL_ACTIVE_STATE_RUN]: i18n.t('controller:Grbl.activeState.run'),
                [GRBL_ACTIVE_STATE_HOLD]: i18n.t('controller:Grbl.activeState.hold'),
                [GRBL_ACTIVE_STATE_DOOR]: i18n.t('controller:Grbl.activeState.door'),
                [GRBL_ACTIVE_STATE_HOME]: i18n.t('controller:Grbl.activeState.home'),
                [GRBL_ACTIVE_STATE_SLEEP]: i18n.t('controller:Grbl.activeState.sleep'),
                [GRBL_ACTIVE_STATE_ALARM]: i18n.t('controller:Grbl.activeState.alarm'),
                [GRBL_ACTIVE_STATE_CHECK]: i18n.t('controller:Grbl.activeState.check')
            }[activeState];
        }

        if (controllerType === SMOOTHIE) {
            const activeState = _.get(controllerState, 'status.activeState');

            stateStyle = {
                [SMOOTHIE_ACTIVE_STATE_IDLE]: 'controller-state-default',
                [SMOOTHIE_ACTIVE_STATE_RUN]: 'controller-state-primary',
                [SMOOTHIE_ACTIVE_STATE_HOLD]: 'controller-state-warning',
                [SMOOTHIE_ACTIVE_STATE_DOOR]: 'controller-state-warning',
                [SMOOTHIE_ACTIVE_STATE_HOME]: 'controller-state-primary',
                [SMOOTHIE_ACTIVE_STATE_SLEEP]: 'controller-state-success',
                [SMOOTHIE_ACTIVE_STATE_ALARM]: 'controller-state-danger',
                [SMOOTHIE_ACTIVE_STATE_CHECK]: 'controller-state-info'
            }[activeState];

            stateText = {
                [SMOOTHIE_ACTIVE_STATE_IDLE]: i18n.t('controller:Smoothie.activeState.idle'),
                [SMOOTHIE_ACTIVE_STATE_RUN]: i18n.t('controller:Smoothie.activeState.run'),
                [SMOOTHIE_ACTIVE_STATE_HOLD]: i18n.t('controller:Smoothie.activeState.hold'),
                [SMOOTHIE_ACTIVE_STATE_DOOR]: i18n.t('controller:Smoothie.activeState.door'),
                [SMOOTHIE_ACTIVE_STATE_HOME]: i18n.t('controller:Smoothie.activeState.home'),
                [SMOOTHIE_ACTIVE_STATE_SLEEP]: i18n.t('controller:Smoothie.activeState.sleep'),
                [SMOOTHIE_ACTIVE_STATE_ALARM]: i18n.t('controller:Smoothie.activeState.alarm'),
                [SMOOTHIE_ACTIVE_STATE_CHECK]: i18n.t('controller:Smoothie.activeState.check')
            }[activeState];
        }

        if (controllerType === TINYG2) {
            const machineState = _.get(controllerState, 'sr.machineState');

            // https://github.com/synthetos/g2/wiki/Alarm-Processing
            stateStyle = {
                [TINYG2_MACHINE_STATE_INITIALIZING]: 'controller-state-warning',
                [TINYG2_MACHINE_STATE_READY]: 'controller-state-default',
                [TINYG2_MACHINE_STATE_ALARM]: 'controller-state-danger',
                [TINYG2_MACHINE_STATE_STOP]: 'controller-state-default',
                [TINYG2_MACHINE_STATE_END]: 'controller-state-default',
                [TINYG2_MACHINE_STATE_RUN]: 'controller-state-primary',
                [TINYG2_MACHINE_STATE_HOLD]: 'controller-state-warning',
                [TINYG2_MACHINE_STATE_PROBE]: 'controller-state-primary',
                [TINYG2_MACHINE_STATE_CYCLE]: 'controller-state-primary',
                [TINYG2_MACHINE_STATE_HOMING]: 'controller-state-primary',
                [TINYG2_MACHINE_STATE_JOG]: 'controller-state-primary',
                [TINYG2_MACHINE_STATE_INTERLOCK]: 'controller-state-warning',
                [TINYG2_MACHINE_STATE_SHUTDOWN]: 'controller-state-danger',
                [TINYG2_MACHINE_STATE_PANIC]: 'controller-state-danger'
            }[machineState];

            stateText = {
                [TINYG2_MACHINE_STATE_INITIALIZING]: i18n.t('controller:TinyG2.machineState.initializing'),
                [TINYG2_MACHINE_STATE_READY]: i18n.t('controller:TinyG2.machineState.ready'),
                [TINYG2_MACHINE_STATE_ALARM]: i18n.t('controller:TinyG2.machineState.alarm'),
                [TINYG2_MACHINE_STATE_STOP]: i18n.t('controller:TinyG2.machineState.stop'),
                [TINYG2_MACHINE_STATE_END]: i18n.t('controller:TinyG2.machineState.end'),
                [TINYG2_MACHINE_STATE_RUN]: i18n.t('controller:TinyG2.machineState.run'),
                [TINYG2_MACHINE_STATE_HOLD]: i18n.t('controller:TinyG2.machineState.hold'),
                [TINYG2_MACHINE_STATE_PROBE]: i18n.t('controller:TinyG2.machineState.probe'),
                [TINYG2_MACHINE_STATE_CYCLE]: i18n.t('controller:TinyG2.machineState.cycle'),
                [TINYG2_MACHINE_STATE_HOMING]: i18n.t('controller:TinyG2.machineState.homing'),
                [TINYG2_MACHINE_STATE_JOG]: i18n.t('controller:TinyG2.machineState.jog'),
                [TINYG2_MACHINE_STATE_INTERLOCK]: i18n.t('controller:TinyG2.machineState.interlock'),
                [TINYG2_MACHINE_STATE_SHUTDOWN]: i18n.t('controller:TinyG2.machineState.shutdown'),
                [TINYG2_MACHINE_STATE_PANIC]: i18n.t('controller:TinyG2.machineState.panic')
            }[machineState];
        }

        return (
            <div
                className={classNames(
                    styles.controllerState,
                    styles[stateStyle]
                )}
            >
                {stateText}
            </div>
        );
    }
    getWorkCoordinateSystem() {
        const { state } = this.props;
        const controllerType = state.controller.type;
        const controllerState = state.controller.state;
        const defaultWCS = 'G54';

        if (controllerType === GRBL) {
            return _.get(controllerState, 'parserstate.modal.coordinate', defaultWCS);
        }

        if (controllerType === TINYG2) {
            return _.get(controllerState, 'sr.modal.coordinate', defaultWCS);
        }

        return defaultWCS;
    }
    render() {
        const { state, actions } = this.props;
        const { units, disabled, gcode, objects } = state;
        const controllerType = this.renderControllerType();
        const controllerState = this.renderControllerState();
        const canSendCommand = this.canSendCommand();
        const canToggle3DOptions = Detector.webgl && !disabled;
        const wcs = this.getWorkCoordinateSystem();

        return (
            <div>
                {controllerType}
                {controllerState}
                <div className="pull-right">
                    <Dropdown
                        style={{
                            marginBottom: 2,
                            marginRight: 5
                        }}
                        bsSize="xs"
                        id="units-dropdown"
                        disabled={!canSendCommand}
                        pullRight
                    >
                        <Dropdown.Toggle
                            title={i18n._('Units')}
                            style={{ minWidth: 50 }}
                        >
                            {units === IMPERIAL_UNITS && i18n._('in')}
                            {units === METRIC_UNITS && i18n._('mm')}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <MenuItem
                                active={units === IMPERIAL_UNITS}
                                onSelect={() => {
                                    controller.command('gcode', 'G20');
                                }}
                            >
                                {i18n._('Inches (G20)')}
                            </MenuItem>
                            <MenuItem
                                active={units === METRIC_UNITS}
                                onSelect={() => {
                                    controller.command('gcode', 'G21');
                                }}
                            >
                                {i18n._('Millimeters (G21)')}
                            </MenuItem>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown
                        style={{
                            marginBottom: 2,
                            marginRight: 5
                        }}
                        bsSize="xs"
                        id="wcs-dropdown"
                        disabled={!canSendCommand}
                        pullRight
                    >
                        <Dropdown.Toggle
                            title={i18n._('Work Coordinate System')}
                            style={{ minWidth: 50 }}
                        >
                            {wcs}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <MenuItem header>{i18n._('Work Coordinate System')}</MenuItem>
                            <MenuItem
                                active={wcs === 'G54'}
                                onSelect={() => {
                                    controller.command('gcode', 'G54');
                                }}
                            >
                                G54 (P1)
                            </MenuItem>
                            <MenuItem
                                active={wcs === 'G55'}
                                onSelect={() => {
                                    controller.command('gcode', 'G55');
                                }}
                            >
                                G55 (P2)
                            </MenuItem>
                            <MenuItem
                                active={wcs === 'G56'}
                                onSelect={() => {
                                    controller.command('gcode', 'G56');
                                }}
                            >
                                G56 (P3)
                            </MenuItem>
                            <MenuItem
                                active={wcs === 'G57'}
                                onSelect={() => {
                                    controller.command('gcode', 'G57');
                                }}
                            >
                                G57 (P4)
                            </MenuItem>
                            <MenuItem
                                active={wcs === 'G58'}
                                onSelect={() => {
                                    controller.command('gcode', 'G58');
                                }}
                            >
                                G58 (P5)
                            </MenuItem>
                            <MenuItem
                                active={wcs === 'G59'}
                                onSelect={() => {
                                    controller.command('gcode', 'G59');
                                }}
                            >
                                G59 (P6)
                            </MenuItem>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown
                        style={{
                            marginBottom: 2,
                            marginRight: 0
                        }}
                        bsSize="xs"
                        id="visualizer-dropdown"
                        pullRight
                    >
                        <Dropdown.Toggle
                            title={i18n._('Options')}
                            style={{ minWidth: 50 }}
                        >
                            <i className="fa fa-cubes" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <MenuItem
                                style={{ color: '#222' }}
                                header
                            >
                                <Interpolate
                                    format={'WebGL: {{status}}'}
                                    replacement={{
                                        status: Detector.webgl
                                            ? (<span style={{ color: colornames('royalblue') }}>{i18n._('Enabled')}</span>)
                                            : (<span style={{ color: colornames('crimson') }}>{i18n._('Disabled')}</span>)
                                    }}
                                />
                            </MenuItem>
                            <MenuItem divider />
                            <MenuItem
                                onSelect={actions.toggle3DView}
                            >
                                {(!Detector.webgl || disabled)
                                    ? <i className="fa fa-toggle-off" />
                                    : <i className="fa fa-toggle-on" />
                                }
                                <span className="space" />
                                {(!Detector.webgl || disabled)
                                    ? i18n._('Enable 3D View')
                                    : i18n._('Disable 3D View')
                                }
                            </MenuItem>
                            <MenuItem divider />
                            <MenuItem
                                disabled={!canToggle3DOptions}
                                onSelect={actions.toggleGCodeFilename}
                            >
                                {gcode.displayName
                                    ? <i className="fa fa-toggle-on" />
                                    : <i className="fa fa-toggle-off" />
                                }
                                <span className="space" />
                                {i18n._('Display G-code Filename')}
                            </MenuItem>
                            <MenuItem
                                disabled={!canToggle3DOptions}
                                onSelect={actions.toggleCoordinateSystemVisibility}
                            >
                                {objects.coordinateSystem.visible
                                    ? <i className="fa fa-toggle-on" />
                                    : <i className="fa fa-toggle-off" />
                                }
                                <span className="space" />
                                {objects.coordinateSystem.visible
                                    ? i18n._('Hide Coordinate System')
                                    : i18n._('Show Coordinate System')
                                }
                            </MenuItem>
                            <MenuItem
                                disabled={!canToggle3DOptions}
                                onSelect={actions.toggleToolheadVisibility}
                            >
                                {objects.toolhead.visible
                                    ? <i className="fa fa-toggle-on" />
                                    : <i className="fa fa-toggle-off" />
                                }
                                <span className="space" />
                                {objects.toolhead.visible
                                    ? i18n._('Hide Toolhead')
                                    : i18n._('Show Toolhead')
                                }
                            </MenuItem>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        );
    }
}

export default Controls;
