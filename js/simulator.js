var length  = 12;
var size    = 30;
var power   = 100;

var limit, warning, timeToBoot, reqCount;
var initVars = () => {
    limit      = parseInt(document.getElementById("threshold").value);
    warning    = limit * 0.8;
    timeToBoot = parseInt(document.getElementById("time-to-boot").value);
    reqCount   = parseInt(document.getElementById("req-count").value);
};
initVars.call();
setInterval(initVars, 1000);

var canvas = document.getElementById('canvas');
var score = document.getElementById('score');

class Namerakad {
    constructor(length, size) {
        this.length = length;
        this.size   = size;
        this.matrix = [];
        this.timer;

        // length * length個のノードを正方形にしきつめる
        for (var i = 0; i < this.length * this.length; i++) {
            var x = (this.size * i) - (this.size * this.length * Math.floor(i/this.length));
            var y = Math.floor(i/this.length) * this.size;
            var n = new Node(x, y, this.size);
            this.add(n);
            n.start();
        }
    }

    allNodes() {
        var nodes = [];
        this.matrix.forEach((row) => {
            row.forEach((e) => {
                nodes.push(e);
            });
        });

        return nodes;
    }

    start() {
        if (!this.timer) {
            this.timer = setInterval(() => {
                this.recover();
                this.updateScore();
            }, 1000);
        }

        this.allNodes().forEach((n) => n.start());
    }

    stop() {
        clearInterval(this.timer);
        this.timer = undefined;

        this.allNodes().forEach((n) => n.stop());
    }

    add(node) {
        for (var i = 0; i < this.length; i++) {
            // 行に配列がまだない場合は配列を作って追加
            if (!this.matrix[i]) {
                this.matrix[i] = [node];
                return;
            }
            // 行がサイズ以内の配列なら後ろに追加
            if (this.matrix[i].length < this.length) {
                this.matrix[i].push(node);
                return;
            }
        }
    }

    updateScore() {
        var sum   = 0;
        var count = 0;

        for (var i in this.matrix) {
            for (var j in this.matrix[i]) {
                var n = this.matrix[i][j];
                sum += n.score();

                if (!n.dead) {
                    count++;
                }
            }
        }

        score.innerHTML = 'ノード数: ' + count + ', スコア総計: ' + sum;
    }

    recover() {
        for (var i in this.matrix) {
            for (var j in this.matrix[i]) {
                var n = this.matrix[i][j];
                if (n && !n.dead) {
                    n.recover(this.matrix, i, j);
                }
            }
        }
    }

    draw() {
        for (var i in this.matrix) {
            for (var j in this.matrix[i]) {
                var n = this.matrix[i][j];
                n.draw();
            }
        }
    }
}

class Node {
    constructor(x, y, size) {
        this.x     = x;
        this.y     = y;
        this.size  = size;

        this.color = '#92b0f7'; // ノードの負荷状況を示す色
        this.load  = 0;         // 負荷
        this.dead  = false;     // 死亡

        this.dom                       = document.createElement('div');
        this.dom.style.backgroundColor = this.color;
        this.dom.style.position        = 'absolute';
        this.dom.style.width           = this.size + 'px';
        this.dom.style.height          = this.size + 'px';
        this.dom.style.left            = this.x + 'px';
        this.dom.style.top             = this.y + 'px';
        this.dom.style.borderRadius    = this.size + 'px';
        canvas.appendChild(this.dom);

        this.timer;
    }

    start() {
        if (!this.timer) {
            this.timer = setInterval(() => {
                this.update();
            }, 1000);
        }
        this.draw();
    }

    stop() {
        clearInterval(this.timer);
        this.timer = undefined;
    }

    draw() {
        this.dom.style.backgroundColor = this.color;
    }

    update() {
        if (Math.floor(Math.random() > 0.9)) {
            this.load += (reqCount/(length*length)) + Math.random() * (6 - 1) * 1;
        }

        if (this.load > limit) {
            this.die();
        }
        else if (this.load >= warning) {
            this.markWarning();
        }
    }

    markWarning() {
        this.color = '#f7f292';
        this.draw();
    }

    die() {
        this.dead  = true;
        this.color = '#f13238';
        this.draw();
        this.stop();
    }

    // 左右を見て死んでたら新しいノードを作っておきかえる
    recover(m, i, j) {
        var left = m[i][j - 1];
        if (left && left.dead) {
            // ノードが起動するには時間がかかる
            setTimeout(() => {
                canvas.removeChild(m[i][j - 1].dom);
                m[i][j - 1] = undefined;
                var n = new Node(left.x, left.y, left.size);
                m[i][j - 1] = n;
                n.start();
            }, timeToBoot);
        }

        var right = m[i][j + 1];
        if (right && right.dead) {
            // ノードが起動するには時間がかかる
            setTimeout(() => {
                canvas.removeChild(m[i][j + 1].dom);
                m[i][j + 1] = undefined;
                var n = new Node(right.x, right.y, right.size);
                m[i][j + 1] = n;
                n.start();
            }, timeToBoot);
        }
    }

    score() {
        if (this.dead) {
            return 0;
        }
        else {
            return power - this.load;
        }
    }
}

var namerakad = new Namerakad(length, size);
    namerakad.start();
