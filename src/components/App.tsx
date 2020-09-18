import React from 'react'
import { Provider } from 'react-redux'
import buildStore from '../reducers'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import Project from './Project'
import NonScrollable from './NonScrollable'
import theme from '../themes/default'

const { store } = buildStore()

const GlobalStyled = createGlobalStyle`
    body {
        margin: 0;
        overflow: hidden;
    }

    #root:focus {
        outline: none;  
    }
`

export default () => {

    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <GlobalStyled />
                <NonScrollable>
                    <Project width={600} height={400} />
                </NonScrollable>
                {/* <NonScrollable>
                    <NoteEditor width={600} height={400} />
                </NonScrollable> */}
                {/* <History /> */}
            </ThemeProvider>
        </Provider>
    )
}