import * as actionTypes from '../actions/actionTypes'
import generateId from '../../utils/generateId'
/**
 * Storing step order as an array of ids and the steps in
 * a different object to decouple the order of steps (which
 * should not ideally be represented as an inherent step
 * property, since it's a group property) from the inherent
 * step properties.
 */
const initialState = {
    pathwayId: '',
    pathwayName: '',
    pathwayDescription: '',
    pathwayTags: [],
    // stepOrder: ['step1', 'step2', 'step3'],
    stepOrder: [],
    steps: {
        // step1: {
        //     heading: 'This is a pathway step',
        //     content: '# hello',
        //     stepType: 'PATHWAY_STEP',
        //     selected: false,
        //     timeLimit: 20,
        //     isPreview: false,
        //     typeId: '',
        //     // rating: 2
        // },
        // step2: {
        //     heading: 'This is a content step',
        //     content: '# hello',
        //     stepType: 'CONTENT_STEP',
        //     selected: false,
        //     timeLimit: 30,
        //     isPreview: false,
        //     typeId: '',
        //     // rating: 1
        // },
        // step3: {
        //     heading: 'This is a shared step',
        //     content: '# hello',
        //     stepType: 'SHARED_STEP',
        //     selected: false,
        //     timeLimit: 40,
        //     isPreview: false,
        //     typeId: '',
        //     // rating: 3
        // },
    },
    selectedStep: '',
    showPathwayDetailsScreen: false,
    modalCloseOnOverlay: true,
    initialState: false,
}

const addStep = (state, action) => {
    const id = action.stepData.id
    const newStepOrder = state.stepOrder.concat(id)

    let newSteps = { ...state.steps }
    newSteps[id] = action.stepData

    return {
        ...state,
        stepOrder: newStepOrder,
        steps: newSteps,
    }
}

const reorderSteps = (state, action) => {
    const result = action.result
    const newSteps = Array.from(state.stepOrder)
    const [removed] = newSteps.splice(result.source.index, 1)
    newSteps.splice(result.destination.index, 0, removed)

    return {
        ...state,
        stepOrder: newSteps,
    }
}

/**
 * Remove the step from the stepOrder list so that it doesn't appear,
 * but do not delete the step's data from the steps object. This can
 * be used to give the user a restore option.
 */
const deleteStep = (state, action) => {
    let stepOrder = state.stepOrder
    const index = stepOrder.indexOf(action.stepId)
    stepOrder.splice(index, 1)
    const newStepOrder = [...stepOrder]

    return {
        ...state,
        stepOrder: newStepOrder,
    }
}

const selectStepForEditing = (state, action) => {
    let newSteps = { ...state.steps }
    if (state.selectedStep != '') {
        newSteps[state.selectedStep].selected = false
    }

    newSteps[action.stepId].selected = true

    return {
        ...state,
        steps: newSteps,
        selectedStep: action.stepId,
    }
}

const selectStepForPreview = (state, action) => {
    let newSteps = { ...state.steps }
    let isPreview = newSteps[state.selectedStep]['isPreview']

    newSteps[action.stepId].isPreview = !isPreview
    return {
        ...state,
        steps: newSteps,
    }
}

const updateStep = (state, action) => {
    const id = action.stepId
    let updatedStep = state.steps[id]
    updatedStep = {
        ...updatedStep,
        ...action.stepData,
    }
    const updatedSteps = { ...state.steps }
    updatedSteps[id] = updatedStep

    return {
        ...state,
        steps: updatedSteps,
    }
}

const updatePathwayDetails = (state, action) => {
    return {
        ...state,
        pathwayId: action.id,
        pathwayName: action.name,
        pathwayDescription: action.description,
    }
}

const addTag = (state, action) => {
    let tags = [...state.pathwayTags]
    tags.push(action.tag)
    return {
        ...state,
        pathwayTags: tags,
    }
}

const removeTag = (state, action) => {
    let tags = [...state.pathwayTags]
    let finalTags = tags.filter((tag) => tag !== action.tag)
    return {
        ...state,
        pathwayTags: finalTags,
    }
}

// When user creates a new pathway, modal shouldn't be closed without filling pathway details
// Overlay closing disabled on creating pathway
const toggleModalCloseOnOverlay = (state) => {
    return {
        ...state,
        modalCloseOnOverlay: true
    }
}

// When user creates a new pathway, the modal should be the first thing visible on the screen
// This action also controls the modal opening and closing
const togglePathwayDetailsScreen = (state, action=null) => {
    if(action.payload != null) {
        return {
            ...state,
            showPathwayDetailsScreen: action.payload
        }
    } else {
        return {
            ...state,
            showPathwayDetailsScreen: !state.showPathwayDetailsScreen
        }
    }
}

// if the pathway is already created, steps should initialized with existing steps
// of that pathway
const updatePathwayInitialState = (state, action) => {
    let steps = {}
    if(action.payload == null) {
        return state
    }
    let tags = action.payload.tags.map(tag => tag.name)
    let stepOrder = new Array(action.payload.steps.length)
    
    action.payload.steps.forEach((step) => {
        const id = step.id
        stepOrder[step.index] = id
        const newStep = {
            id: id,
            heading: step.content ? step.content.title : step.name,
            content: step.content ? step.content.content : "",
            stepType: step.stepType,
            selected: false,
            timeLimit: step.time,
            isPreview: false,
            typeId: step.content ? step.content.id : "",
            shareId: "",
            // rating: 1
        }
        steps[id] = newStep
    })

    let count = 0
    stepOrder.forEach(_ => count++)
    if(count !== stepOrder.length) {
        stepOrder = []
        action.payload.steps.forEach((step) => {
            stepOrder = stepOrder.concat(step.id)
        })
    }

    return {
        ...state,
        pathwayId: action.payload.id,
        pathwayName: action.payload.name,
        pathwayDescription: action.payload.description,
        pathwayTags: tags,
        stepOrder: stepOrder,
        steps: steps,
        initialState: true,
    }
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.ADD_STEP:
            return addStep(state, action)
        case actionTypes.REORDER_STEPS:
            return reorderSteps(state, action)
        case actionTypes.DELETE_STEP:
            return deleteStep(state, action)
        case actionTypes.SELECT_FOR_EDITING:
            return selectStepForEditing(state, action)
        case actionTypes.UPDATE_STEP:
            return updateStep(state, action)
        case actionTypes.SELECT_FOR_PREVIEW:
            return selectStepForPreview(state, action)
        case actionTypes.UPDATE_PATHWAY_NAME:
            return updatePathwayDetails(state, action)
        case actionTypes.ADD_TAG:
            return addTag(state, action)
        case actionTypes.REMOVE_TAG:
            return removeTag(state, action)
        case actionTypes.TOGGLE_PATHWAY_DETAILS_SCREEN:
            return togglePathwayDetailsScreen(state, action)
        case actionTypes.TOGGLE_MODAL_CLOSE_ON_OVERLAY:
            return toggleModalCloseOnOverlay(state)
        case actionTypes.UPDATE_PATHWAY_INITIAL_STATE:
            return updatePathwayInitialState(state, action)
        default:
            return state
    }
}

export default reducer
