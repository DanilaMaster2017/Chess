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
import { PieceType } from '../types/PieceType';
import { Piece } from '../types/Piece';

export function getPieceImage(piece: Piece) {
    if (piece.color === 'white') {
        switch (piece.type) {
            case PieceType.pawn:
                return whitePawn;
            case PieceType.knight:
                return whiteKnight;
            case PieceType.rook:
                return whiteRook;
            case PieceType.bishop:
                return whiteBishop;
            case PieceType.king:
                return whiteKing;
            case PieceType.queen:
                return whiteQueen;
        }
    } else {
        switch (piece.type) {
            case PieceType.pawn:
                return blackPawn;
            case PieceType.knight:
                return blackKnight;
            case PieceType.rook:
                return blackRook;
            case PieceType.bishop:
                return blackBishop;
            case PieceType.king:
                return blackKing;
            case PieceType.queen:
                return blackQueen;
        }
    }
}
