import {createContext, useReducer } from 'react'

export const AuthContext = createContext()

// prende in input lo stato attuale e un'azione
export const authReducer = (state, action) => {
    // gestiamo le varie azioni, impostando lo stato opprtunamente
    switch(action.type) {
        case 'LOGIN':
            return { user: action.payload } // lo stato restituito in questo caso

        case 'LOGOUT':
            return { user: null }
        
        default:
            return state // restituiamo lo stato così com'è
    }
}

export const AuthContextProvider = ( { children } ) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null
    })

    console.log('AuthContext state: ', state)

    return (
        <AuthContext.Provider value={{...state, dispatch}}>
            { children }
        </AuthContext.Provider>
    )
}