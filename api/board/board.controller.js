const boardService = require('./board.service');
const loggerService = require('../../services/logger.service');

async function getBoards(req, res) {
    // var filterBy = req.query;
    try {
        // console.log('in getBoards');
        // console.log('boards:', boards)
        const boards = await boardService.query()
        res.send(boards)
    } catch (err) {
        loggerService.error('Couldn`t get boards from DB', err);
        res.status(500).send({ err: 'Failed to get boards' })
    }
}

async function getBoard(req, res) { 
    try {
        const board = await boardService.getById(req.params.id);
        res.send(board);
    } catch (err) {
        loggerService.error('Couldn`t get board', err)
        res.status(500).send({ err: 'Failed to get board' })
    }
}

async function addBoard(req, res) {
    try {
        const board = req.body;
        const savedBoard = await boardService.add(board);
        res.send(savedBoard);
    } catch (err) {
        loggerService.error('Couldn`t add board', err)
        res.status(500).send({ err: 'Failed to add board' })
    }

}

async function updateBoard(req, res) {
    try {
        const board = req.body;
        const savedBoard = await boardService.update(board);
        res.send(savedBoard);
    } catch (err) {
        loggerService.error('Couldn`t update board', err)
        res.status(500).send({ err: 'Failed to update board' })
    }
}

async function deleteBoard(req, res) {
    try {
        await boardService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete board', err)
        res.status(500).send({ err: 'Failed to delete board' })
    }
}

module.exports = {
    getBoards,
    getBoard,
    addBoard,
    updateBoard,
    deleteBoard
}