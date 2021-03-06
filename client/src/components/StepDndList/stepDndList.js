import React, { Component } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { connect } from 'react-redux'
import { Mutation } from 'react-apollo'

import Step from './Step/step'
import NumberStat from '../NumberStat/NumberStat'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import PlusIcon from 'react-ionicons/lib/MdAdd'
import SaveIcon from 'react-ionicons/lib/IosCheckmarkCircleOutline'
import PreviewIcon from 'react-ionicons/lib/IosPlay'
import DownloadIcon from 'react-ionicons/lib/IosDownloadOutline'
import SettingsIcon from 'react-ionicons/lib/IosSettings'

import * as actions from '../../store/actions/index'

import classes from './StepDndList.module.css'
import generateId from '../../utils/generateId'
import * as mutations from '../../utils/mutations/updatePathway'
import UPDATE_STEP from '../../utils/mutations/updateStep'

const getListStyle = (isDraggingOver) => ({
    background: '#fafafa',
    width: '500px',
    overflowY: 'auto',
    height: '100%',
    paddingLeft: '10px',
    paddingRight: '30px',
    paddingTop: '20px',
    flex: '1 1 auto',
})

/**
 * But...but...
 * class based components are so easy to use!
 */
class StepDndList extends Component {
    constructor(props) {
        super(props)
        this.onDragEnd = this.onDragEnd.bind(this)
        this.state = {
            anchorEl: null,
        }
    }

    handleClick = (event) => {
        this.setState({
            anchorEl: event.currentTarget,
        })
    }

    handleClose = (type, updatePathway=null, updateStep=null) => {
        this.setState({
            anchorEl: null,
        })
        this.onAddBtnClick(type, updatePathway, updateStep)
    }

    onDragEnd(result) {
        if (!result.destination) {
            return
        }

        // from redux
        this.props.onReorderSteps(result)
    }

    onAddBtnClick = (type, updatePathway, updateStep) => {
        const stepId = generateId("step")
        const contentId = generateId('content')
        const timeLimit = 30
        let stepName, stepType

        if (type === 'PATHWAY_STEP') {
            this.props.onAddStep({
                heading: 'This is a step',
                stepType: 'PATHWAY_STEP',
                id: stepId,
                timeLimit: timeLimit
            })
            stepName = 'Pathway Step'
            stepType = 'PATHWAY_STEP'
        } else if (type === 'CONTENT_STEP') {
            this.props.onAddStep({
                heading: 'This is a step',
                stepType: 'CONTENT_STEP',
                id: stepId,
                timeLimit: timeLimit,
                typeId: contentId
            })
            stepName = 'Content Step'
            stepType = 'CONTENT_STEP'
        } else if (type === 'SHARED_STEP') {
            this.props.onAddStep({
                heading: 'This is a step',
                stepType: 'SHARED_STEP',
                id: stepId,
                timeLimit: timeLimit
            })
            stepName = 'Shared Step'
            stepType = 'SHARED_STEP'
        }
        
        const newStep = {
            id: stepId,
            name: stepName,
            time: timeLimit,
            index: Object.keys(this.props.steps).length,
            stepType: stepType,
            typeId: ""
        }

        if(type === 'CONTENT_STEP' && updateStep) {
            
            updateStep({
                variables: {
                    id: contentId,
                    title: 'This is a step',
                    content: 'Step Content',
                },
            })
            .then(res => {
                console.log(res)
                newStep["typeId"] = contentId
                this.addNewStep(newStep, updatePathway)
            })
            .catch((err) => console.log(err))
            
        } else {
            this.addNewStep(newStep, updatePathway)
        }

    }

    addNewStep = (newStep, updatePathway) => {
        if(updatePathway) {
            updatePathway({variables: {
                id: this.props.pathwayId,
                name: this.props.pathwayName,
                steps: [newStep],
                tags: this.props.pathwayTags,
                description: this.props.pathwayDescription
            }})
            .then( res => {
                console.log(res)
            })
            .catch(e => {
                console.log(JSON.parse(JSON.stringify(e)))
            })
        }
    }

    setPathwayDetails = () => {
        this.props.showPathwayDetailsScreen()
    }

    getParentSize() {
        return (
            (this.plusIconRef &&
                this.plusIconRef.current &&
                this.plusIconRef.current.offsetTop) ||
            0
        )
    }

    render() {
        const stepData = this.props.steps
        const steps = this.props.stepOrder.map((stepId, index) => {
            const currentStep = stepData[stepId]
            return (
                <Step
                    key={index}
                    id={stepId}
                    index={index}
                    heading={currentStep.heading}
                    stepType={currentStep.stepType}
                    selected={currentStep.selected}
                    rating={currentStep.rating}
                />
            )
        })

        return (
            <div className={classes.ControlsArea}>
                <div className={classes.StepListArea}>
                    <div className={classes.StepListTitle}>
                        <p style={{ fontSize: '40px' }}>Steps</p>
                        <Button
                            aria-controls='simple-menu'
                            aria-haspopup='true'
                            onClick={this.handleClick}
                        >
                            <PlusIcon fontSize='30px' color='#555' />
                        </Button>
                        <Mutation mutation={ mutations.CREATE_UPDATE_PATHWAY }>
                            {(updatePathway) => (
                                <Menu
                                    id='simple-menu'
                                    anchorEl={this.state.anchorEl}
                                    keepMounted
                                    open={Boolean(this.state.anchorEl)}
                                    onClose={() => {this.handleClose("", null)}}
                                >
                                    <MenuItem
                                        onClick={() => this.handleClose('PATHWAY_STEP', updatePathway)}
                                    >
                                        <div className={classes.pathwayStep}>
                                            Pathway
                                        </div>
                                    </MenuItem>
                                    <Mutation mutation={UPDATE_STEP}>
                                        {(updateStep) => (  
                                            <MenuItem
                                                onClick={() => this.handleClose('CONTENT_STEP', updatePathway, updateStep)}
                                            >
                                                <div className={classes.contentStep}>
                                                    Content
                                                </div>
                                            </MenuItem>
                                        )}
                                    </Mutation>
                                    <MenuItem
                                        onClick={() => this.handleClose('SHARED_STEP', updatePathway)}
                                    >
                                        <div className={classes.sharedStep}>
                                            Shared Step
                                        </div>
                                    </MenuItem>
                                </Menu>
                            )}
                        </Mutation>
                    </div>

                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId='myNiggaThatsCrazy'>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={getListStyle(
                                        snapshot.isDraggingOver
                                    )}
                                >
                                    {steps}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                <div className={classes.MoreControls}>
                    <div>
                        <div className={classes.MoreControlsIcon}>
                            <SaveIcon fontSize='50px' color='#102e4a' />
                        </div>
                        <div
                            className={classes.MoreControlsIcon}
                            onClick={this.setPathwayDetails}
                        >
                            <SettingsIcon fontSize='50px' color='#102e4a' />
                        </div>
                        <div className={classes.MoreControlsIcon}>
                            {/* Clicking on this icon should render a preview of the pathway */}
                            <PreviewIcon fontSize='50px' color='#102e4a' />
                        </div>
                    </div>
                    <div>
                        <div className={classes.MoreControlsIcon}>
                            <DownloadIcon fontSize='50px' color='#102e4a' />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onAddStep: (stepData) => dispatch(actions.addStep(stepData)),
        onReorderSteps: (result) => dispatch(actions.reorderSteps(result)),
    }
}

const mapStateToProps = (state) => {
    return {
        stepOrder: state.createEditPathway.stepOrder,
        steps: state.createEditPathway.steps,
        // current pathway data needed to add a step
        pathwayId: state.createEditPathway.pathwayId,
        pathwayName: state.createEditPathway.pathwayName,
        pathwayTags: state.createEditPathway.pathwayTags,
        pathwayDescription: state.createEditPathway.pathwayDescription,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StepDndList)
