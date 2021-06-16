import whitePawn from '../images/chessPieces/wp.svg';
import whiteRook from '../images/chessPieces/wr.svg';
import whiteBishop from '../images/chessPieces/wb.svg';
import whiteKnight from '../images/chessPieces/wn.svg';
import whiteKing from '../images/chessPieces/wk.svg';
import whiteQueen from '../images/chessPieces/wq.svg';
import blackPawn from '../images/chessPieces/bp.svg';
import blackRook from '../images/chessPieces/br.svg';
import blackBishop from '../images/chessPieces/bb.svg';
import blackKnight from '../images/chessPieces/bn.svg';
import blackKing from '../images/chessPieces/bk.svg';
import blackQueen from '../images/chessPieces/bq.svg';
import { Piece } from '../types/Piece';

export function getPieceImage(piece:Piece){
    if (piece.color === 'white') {
        switch(piece.type){
            case 'pawn': return whitePawn;
            case 'knight': return whiteKnight;
            case 'rook': return whiteRook;
            case 'bishop': return whiteBishop;
            case 'king': return whiteKing;
            case 'queen': return whiteQueen;
        }
    } else {
        switch(piece.type){
            case 'pawn': return blackPawn;
            case 'knight': return blackKnight;
            case 'rook': return blackRook;
            case 'bishop': return blackBishop;
            case 'king': return blackKing;
            case 'queen': return blackQueen;
        }
    }
}