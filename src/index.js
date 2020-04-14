import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

var BOARD_SIZE = 20;

function Square({value, onClick, color }) {
    return (
        <button className="square" onClick={onClick} style={{width: 30, height: 30, color: color}}>
            {value}
        </button>
    );
}

class Board extends React.Component {
    

    renderSquare(i,_color) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                color = {_color}
            />
        );
    }


    render() {
        var board = [];
        
        for (var i = 0; i < BOARD_SIZE; i++) {
        var row = [];
        for (var j = 0; j < BOARD_SIZE; j++) {
            row.push(this.renderSquare(j + i*BOARD_SIZE, this.props.squares[j +i*BOARD_SIZE]=="O"? "red": "blue"));
            }

        if (this.props.winList && this.props.winner)
        {
            console.log("list: "+this.props.winList)
            for (var l=0; l<this.props.winList.length;l++)
            {
                if (parseInt(this.props.winList[l]/BOARD_SIZE)==i)
                {
                    console.log("color + " + parseInt(this.props.winList[l]/BOARD_SIZE))
                    row[parseInt(this.props.winList[l]%BOARD_SIZE)] = this.renderSquare(this.props.winList[l], "green")
                }
            }
        }
        
        board.push(<div style={{width: 30*BOARD_SIZE}} className="board-row"> {row} </div>);
        }

        return (
            <div>
                {board}
            </div>
        );
    }
}

class Game extends React.Component {constructor(props) {
    super(props);
    if (BOARD_SIZE < 5)
        BOARD_SIZE = 5;
    this.state = {
        history: [
            {
              squares: Array(BOARD_SIZE*BOARD_SIZE).fill(null),
              row: 0,
              col: 0
            }
          ],
          stepNumber: 0,
        xIsNext: true,
        winner: null,
        winList: null,
        isASC: true
    };
}

handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (this.state.winner && this.state.stepNumber === history.length)
        return
    if (squares[i]) {
        return;
    }
   
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    var gameWinner = calculateWinner(squares,i,this.state.xIsNext ? 'X' : 'O',BOARD_SIZE*BOARD_SIZE - this.state.stepNumber);
    console.log("slot tick")
    this.setState({
        history: history.concat([
            {
              squares: squares,
              row: parseInt(i/BOARD_SIZE)+1,
              col: parseInt(i%BOARD_SIZE)+1
            }
          ]),
        stepNumber: history.length,
        winner: gameWinner? (gameWinner.length==1? "Game Tie!": squares[i] + " win!"):null,
        winList: gameWinner,
        xIsNext: !this.state.xIsNext
    });
}

    jumpTo(step) {
        var winPlayer = this.state.winList? (this.state.winList.length==1? "Game Tie!": this.state.history[step].squares[this.state.winList[0]] + " win!"):null
        console.log(this.state.history[step])
        this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
        winner: step === this.state.history.length-1? winPlayer: null
        });
    }


    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        const sort = this.state.isASC === true?  <button onClick={() => {this.setState({isASC: !this.state.isASC})} }>Sort Descending</button> :  <button onClick={() => {this.setState({isASC: !this.state.isASC})}}>Sort Ascending</button>
        const moves = history.map((step, move) => {
        if (this.state.isASC===false)
           {
            move = (history.length - move - 1)
            console.log(move)
           }
        const desc = move ?
            'Go to move #' + move + ' ---- row: '+ history[move].row + ' col: ' + history[move].col + ' ----' :
            'Go to game start'; 
        if (this.state.stepNumber === move)
        {
            return (
                <li key={move}>
                <button style={{width: 300, fontWeight: "bold"}} onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        }
        else
        {
            return (
                <li key={move}>
                <button style={{width: 300}} onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        }

        });
        let status;
        if (this.state.winner) {
            status = 'Game Over: ' + this.state.winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
    
        return (
          <div className="game">
            <div className="game-board">
              <Board
                squares={current.squares}
                winner = {this.state.winner}
                winList = {this.state.winList}
                onClick={i => this.handleClick(i)}
              />
            </div>
            <div className="game-info">
              <div>{status}</div>
              <ol>{sort}</ol>
              <ol>{moves}</ol>
            </div>
          </div>
        );
    }
}

function calculateWinner(squares, i, player, slot) {
    
   var i_row = parseInt(i/BOARD_SIZE);
   var i_col = parseInt(i%BOARD_SIZE);

   var winList = Array();
   if (parseInt(slot) == 1)
    {
        winList.push(-1)
        return winList
    }

   var count = 0; 
   //check row
   for (var c=BOARD_SIZE*i_row;c<BOARD_SIZE*(i_row+1);c++)
   {
        if (squares[c]===player)
            {
                count++;
                winList.push(c)
            }
        else {
            winList = []
            count=0;
        }
        if (count==5)
        {
            console.log(winList)
            return winList;
        }
   }
   count = 0
   winList = []
   //check col
   for (var c=0;c<BOARD_SIZE;c++)
   {
        if (squares[c*BOARD_SIZE+i_col]===player)
        {
            count++;
            winList.push(c*BOARD_SIZE+i_col)
        }
        else {
            winList = []
            count=0;
        }
        if (count==5)
        {
            return winList;
        }
   }
   
   count = 0
   winList = []

    var start = (i_row*BOARD_SIZE+i_col)
    while (start-(BOARD_SIZE+1)>=0&&(start-(BOARD_SIZE+1))%BOARD_SIZE!=(BOARD_SIZE-1))
    {
        start = start -(BOARD_SIZE+1)
    }
    var stop = parseInt(i_row*BOARD_SIZE+i_col)
    while ((stop+(BOARD_SIZE+1))%BOARD_SIZE!=0&&(stop+(BOARD_SIZE+1))<BOARD_SIZE*BOARD_SIZE)
    {
         stop +=(BOARD_SIZE+1)
    }

    for (var c=start;c<stop+1;c+=(BOARD_SIZE+1))
    {
        if (squares[c]===player)
        {
            count++;
            winList.push(c)
        }
        else {
            winList = []
            count=0;
        }
         if (count==5)
         {
             return winList;
         }
    }
    
   count = 0
   winList = []
    start = (i_row*BOARD_SIZE+i_col)
    while (start-(BOARD_SIZE-1)>=0&&(start-(BOARD_SIZE-1))%BOARD_SIZE!=0)
    {
        start = start - (BOARD_SIZE-1)
    }

    stop = parseInt(i_row*BOARD_SIZE+i_col)
    while ((stop+(BOARD_SIZE-1))%BOARD_SIZE!=(BOARD_SIZE-1)&&(stop+(BOARD_SIZE-1))<BOARD_SIZE*BOARD_SIZE)
    {
         stop +=(BOARD_SIZE-1)
    }
    for (var c=start;c<stop+1;c+=(BOARD_SIZE-1))
    {
        if (squares[c]===player)
            {
                count++;
                winList.push(c)
            }
        else {
            winList = []
            count=0;
        }
         if (count==5)
         {
             return winList;
         }
    }

  
   return null;

}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
