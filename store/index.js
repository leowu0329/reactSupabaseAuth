const { createStore, combineReducers } = window.Redux;

// Action Types
const SET_AUTH = 'SET_AUTH';
const CLEAR_AUTH = 'CLEAR_AUTH';
const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';

// Auth Reducer
const initialAuthState = {
    isAuthenticated: false,
    user: null,
    session: null
};

function authReducer(state = initialAuthState, action) {
    switch (action.type) {
        case SET_AUTH:
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                session: action.payload.session
            };
        case CLEAR_AUTH:
            return initialAuthState;
        default:
            return state;
    }
}

// UI Reducer
const initialUiState = {
    sidebarOpen: true
};

function uiReducer(state = initialUiState, action) {
    switch (action.type) {
        case TOGGLE_SIDEBAR:
            return { ...state, sidebarOpen: !state.sidebarOpen };
        default:
            return state;
    }
}

// Root Reducer
const rootReducer = combineReducers({
    auth: authReducer,
    ui: uiReducer
});

const store = createStore(rootReducer);
window.store = store;