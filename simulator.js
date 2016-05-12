var length  = 16;  // 縦横のマス目の数
var size    = 30;  // ノードの縦横の長さ
var warning = 80;  // 警告ライン
var limit   = 100; // ノード死亡

class Node {
    constructor(x, y) {
        this.x     = x;
        this.y     = y;
        this.color = 'white'; // ノードの負荷状況を示す色
        this.load  = 0;       // 負荷
        this.dead  = false;   // 死亡
    }

    update() {
        if (Math.floor(Math.random() > 0.66)) {
            this.load += Math.random() * (5 - 1) * 1;
        } else {
            this.load -= Math.random();
        }

        if (this.load > limit) {
            this.die();
        }
        else if (this.load >= warning) {
            this.markWarning();
        }
    }

    markWarning() {
        this.color = 'red';
    }

    die() {
        this.color = 'black';
        this.dead  = true;
    }

    // 左右を見て死んでたら新しいノードを作っておきかえる
    recover(m, i, j) {
        var left = m[i][j - 1];
        if (left && left.dead) {
            var n = new Node(left.x, left.y);
            m[i][j - 1] = n;
        }

        var right = m[i][j + 1];
        if (right && right.dead) {
            var n = new Node(right.x, right.y);
            m[i][j + 1] = n;
        }
    }
}

class Nodes {
    constructor(length) {
        this.length = length;
        this.matrix = [];
    }

    add(node) {
        for (var i = 0; i < this.length; i++) {
            if (!this.matrix[i]) {
                this.matrix[i] = [node];
                return;
            }
            if (this.matrix[i].length < this.length) {
                this.matrix[i].push(node);
                return;
            }
        }
    }

    update() {
        for (var i in this.matrix) {
            for (var j in this.matrix[i]) {
                var n = this.matrix[i][j];

                if (n.dead) {
                    continue;
                }

                n.update();
            }
        }
    }
}

var nodes = new Nodes(length);
var s = function(p) {
    p.setup = function() {
        for (var i = 0; i < length * length; i++) {
            var x = (size * i + 10) - (size * length * Math.floor(i/length));
            var y = (Math.floor(i/length) * size) + 10;
            var n = new Node(x, y);
            nodes.add(n);
        }

        p.createCanvas(500, 500);
    };

    p.draw = function() {
        p.background(0);
        nodes.update();

        for (var i in nodes.matrix) {
            for (var j in nodes.matrix[i]) {
                var n = nodes.matrix[i][j];

                if (n.dead) {
                    continue;
                }

                n.recover(nodes.matrix, i, j);

                p.push();
                p.fill(n.color);
                p.rect(n.x, n.y, size, size);
                p.pop();
            }
        }
    };
};

var myp5 = new p5(s);
