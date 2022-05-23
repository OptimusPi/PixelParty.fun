
class MapState {
    constructor (width, height) {
        this.tiles = [];

        for (let x = 0; x < width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < height; y++) {
                this.tiles[x][y] = { color: 0 };
            }
        }
    }

    flip(x, y){
        let colorId = 0;

        for (colorId = 0; colorId < 9; colorId++) {
            if (this.tiles[x][y].color === colorId) {
                colorId++;
                break;
            }
        }
        // If flipping a tile from the last color (Brown Square 8)
        // Then go back to the initial color (0)
        if (colorId === 9)  {
            colorId = 0;
        }

        this.tiles[x][y].color = colorId;
    }

    get(x, y) {
        return this.tiles[x][y];
    }
}

module.exports = MapState;