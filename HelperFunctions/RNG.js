function RNG(seed) 
{
    // LCG using GCC's constants
    this.m = 0x80000000; // 2**31;
    this.a = 1103515245;
    this.c = 12345;

    this.seed = seed ? seed : Math.floor(Math.random() * (this.m - 1));
    this.state = this.seed;
}

RNG.prototype.nextInt = function() 
{
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
}

RNG.prototype.nextFloat = function() 
{
    // returns in range [0,1]
    return this.nextInt() / (this.m - 1);
}

RNG.prototype.nextRange = function(start, end)
{
    // returns in range [start, end): including start, excluding end
    // can't modulu nextInt because of weak randomness in lower bits
    var rangeSize = end - start;
    var randomUnder1 = this.nextInt() / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
}

RNG.prototype.choice = function(array) 
{
    return array[this.nextRange(0, array.length)];
}

RNG.prototype.getSeed = function() 
{
    return this.seed;
}

RNG.prototype.getState = function() 
{
    return this.state;
}

RNG.prototype.setSeed = function(seed)
{
    this.seed = seed;
    this.state = seed;
}

module.exports = {
    RNG
};