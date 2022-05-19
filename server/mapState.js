
class MapState {
    constructor (width, height) {
        this.tiles = [];

        for (let x = 0; x < width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < height; y++) {
                this.tiles[x][y] = { visible: false };
            }
        }
    }

    flip(x, y){
        this.tiles[x][y].visible = !this.tiles[x][y].visible;
    }

    get(x, y) {
        return this.tiles[x][y];
    }
}

module.exports = MapState;