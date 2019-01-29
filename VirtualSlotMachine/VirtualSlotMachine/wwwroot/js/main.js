$(document).ready(function() {
    /**
     * Global variables
     */
    var completed = 0,
        imgHeight = 607,
        //7, 3Bar, 2Bar, 2Bar, 1Bar, 1Bar, 1Bar, Cherry, Blank, Blank, Blank, Blank, Blank, Blank, Blank, Blank, Blank
        posArr = [
            505,
            404,
            505,
            303,
            505,
            202,
            505,
            202,
            505,
            101,
            505,
            101,
            505,
            101,
            505,
            0, //cherry
            505
            // 101, //bar 
            // 202, //bar_bar
            // 303, //bar_bar_bar
            // 404, //seven
            // 505 //empty
        ];

    var win = [];
    win[0] = win[0] = win[0] = 1;
    win[101] = win[202] = win[303] = 2;
    win[202] = win[202] = win[202] = 3;
    win[303] = win[303] = win[303] = 4;
    win[404] = win[404] = win[404] = 5;

    var balance = 100;
    var currentBet = 1;

    /**
     * @class Slot
     * @constructor
     */
    function Slot(el, max, step) {
        this.speed = 0; //speed of the slot at any point of time
        this.step = step; //speed will increase at this rate
        this.si = null; //holds setInterval object for the given slot
        this.el = el; //dom element of the slot
        this.maxSpeed = max; //max speed this slot can have
        this.pos = null; //final position of the slot    

        $(el).pan({
            fps: 30,
            dir: 'down'
        });
        $(el).spStop();
    }

    /**
     * @method start
     * Starts a slot
     */
    Slot.prototype.start = function() {
        var _this = this;
        $(_this.el).addClass('motion');
        $(_this.el).spStart();
        _this.si = window.setInterval(function() {
            if(_this.speed < _this.maxSpeed) {
                _this.speed += _this.step;
                $(_this.el).spSpeed(_this.speed);
            }
        }, 100);
    };

    /**
     * @method stop
     * Stops a slot
     */
    Slot.prototype.stop = function() {
        var _this = this,
            limit = 30;
        clearInterval(_this.si);
        _this.si = window.setInterval(function() {
            if(_this.speed > limit) {
                _this.speed -= _this.step;
                $(_this.el).spSpeed(_this.speed);
            }
            if(_this.speed <= limit) {
                _this.finalPos(_this.el);
                $(_this.el).spSpeed(0);
                $(_this.el).spStop();
                clearInterval(_this.si);
                $(_this.el).removeClass('motion');
                _this.speed = 0;
            }
        }, 100);
    };

    /**
     * @method finalPos
     * Finds the final position of the slot
     */
    Slot.prototype.finalPos = function() {
        var el = this.el,
            el_id,
            pos,
            posMin = 2000000000,
            best,
            bgPos,
            i,
            j,
            k;

        el_id = $(el).attr('id');
        //pos = $(el).css('background-position'); //for some unknown reason, this does not work in IE
        pos = document.getElementById(el_id).style.backgroundPosition;
        pos = pos.split(' ')[1];
        pos = parseInt(pos, 10);

        for(i = 0; i < posArr.length; i++) {
            for(j = 0;;j++) {
                k = posArr[i] + (imgHeight * j);
                if(k > pos) {
                    if((k - pos) < posMin) {
                        posMin = k - pos;
                        best = k;
                        this.pos = posArr[i]; //update the final position of the slot
                    }
                    break;
                }
            }
        }

        best += imgHeight + 4;
        bgPos = "0 " + best + "px";
        $(el).animate({
            backgroundPosition:"(" + bgPos + ")"
        }, {
            duration: 200,
            complete: function() {
                completed ++;
            }
        });
    };

    /**
     * @method reset
     * Reset a slot to initial state
     */
    Slot.prototype.reset = function() {
        var el_id = $(this.el).attr('id');
        $._spritely.instances[el_id].t = 0;
        $(this.el).css('background-position', '0px 4px');
        this.speed = 0;
        completed = 0;
        $('#result').html('');
    };

    function enableControl() {
        $('#control').attr("disabled", false);
        $('#bet').attr("disabled", false);
        $('#maxbet').attr("disabled", false);
    }

    function disableControl() {
        $('#control').attr("disabled", true);
        $('#bet').attr("disabled", true);
        $('#maxbet').attr("disabled", true);
    }

    function printResult() {
        var res;
        if(win[a.pos] === win[b.pos] && win[a.pos] === win[c.pos]) {
            res = "You Win!";
            balance += 10;
            $('#balance').html("Balance: " + balance)
        } else {
            res = "You Lose";
            balance -= currentBet;
            $('#balance').html("Balance: " + balance)
        }
        $('#result').html(res);
    }

    //create slot objects
    var a = new Slot('#slot1', 30, 1),
        b = new Slot('#slot2', 45, 2),
        c = new Slot('#slot3', 70, 3);

    /**
     * Slot machine controller
     */
    $('#control').click(function() {
        var x;
        if(this.innerHTML == "Start") {
            currentBet = document.getElementById("bet").value;
            a.start();
            b.start();
            c.start();
            this.innerHTML = "Stop";

            disableControl(); //disable control until the slots reach max speed

            //check every 100ms if slots have reached max speed 
            //if so, enable the control
            x = window.setInterval(function() {
                if(a.speed >= a.maxSpeed && b.speed >= b.maxSpeed && c.speed >= c.maxSpeed) {
                    enableControl();
                    window.clearInterval(x);
                }
            }, 100);
        } else if(this.innerHTML == "Stop") {
            a.stop();
            b.stop();
            c.stop();
            this.innerHTML = "Reset";

            disableControl(); //disable control until the slots stop

            //check every 100ms if slots have stopped
            //if so, enable the control
            x = window.setInterval(function() {
                if(a.speed === 0 && b.speed === 0 && c.speed === 0 && completed === 3) {
                    enableControl();
                    window.clearInterval(x);
                    printResult();
                }
            }, 100);
        } else { //reset
            a.reset();
            b.reset();
            c.reset();
            this.innerHTML = "Start";
        }
    });
    
    $("#maxbet").click(function() {
        if (balance <= 3) {
            currentBet = balance;
        } else {
            currentBet = 3;
        }

        document.getElementById("bet").value = currentBet;
    });
});
