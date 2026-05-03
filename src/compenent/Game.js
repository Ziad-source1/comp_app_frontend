function Game({ game }) {
    return (
        <div className="game">
            <h3>{game.name}</h3>
            <p>{game.description}</p>
        </div>
    );
}
export default Game;