/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Header } from './interface/Header';
import { StartPage } from './interface/StartPage';
import { GameSettingsContext } from './interface/GameSettingsContext';
import { ComputerGamePage } from './interface/ComputerGamePage';
import { GameInfoContext } from './interface/GameInfoContext';
import { BoardContext } from './interface/BoardContext';
import { NotFoundPage } from './interface/NotFoundPage';
import { GameRequestContext } from './interface/GameRequestContext';

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
                <GameSettingsContext>
                    <Switch>
                        <Route exact path="/" component={StartPage}>
                            <GameRequestContext>
                                <StartPage></StartPage>
                            </GameRequestContext>
                        </Route>
                        <Route
                            path="/computer-game"
                            component={ComputerGamePage}
                        >
                            <GameInfoContext>
                                <BoardContext>
                                    <ComputerGamePage></ComputerGamePage>
                                </BoardContext>
                            </GameInfoContext>
                        </Route>
                        <Route component={NotFoundPage}></Route>
                    </Switch>
                </GameSettingsContext>
            </div>
        </BrowserRouter>
    );
}

export default App;
