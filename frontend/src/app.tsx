/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Header } from './interface/Header';
import { StartPage } from './interface/StartPage';
import { GameSettingsContext } from './interface/GameSettingsContext';
import { ComputerGamePage } from './interface/ComputerGamePage';

function App() {
    return (
        <BrowserRouter>
            <div
                css={css`
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: flex-start;
                `}
            >
                <Header></Header>
                <Switch>
                    <GameSettingsContext>
                        <Route exact path="/" component={StartPage}></Route>
                        <Route
                            path="/computer-game"
                            component={ComputerGamePage}
                        ></Route>
                    </GameSettingsContext>
                </Switch>
            </div>
        </BrowserRouter>
    );
}

export default App;
