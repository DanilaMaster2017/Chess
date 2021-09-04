import long from 'long';
import { Players } from './Players';

export interface Position {
    pawns: Players;
    knights: Players;
    rooks: Players;
    bishops: Players;
    queen: Players;
    king: Players;
}
