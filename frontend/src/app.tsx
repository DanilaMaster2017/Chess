/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Header } from './interface/Header';

function App() {
    return (
        <BrowserRouter>
            <Header></Header>
            <Switch></Switch>
        </BrowserRouter>
    );
}

export default App;
