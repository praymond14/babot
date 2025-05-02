function getD1(ignoreOveride = false)
{
    var dateoveride = [false, 4, 28]; //allows for overiding date manually (testing)
    var d1 = new Date(); //get current date
    if (dateoveride[0] && !ignoreOveride) //if we are overiding the date
    {
        var yr = d1.getFullYear(); //get this year
        var dy = dateoveride[2]; //get this day
        var my = dateoveride[1] - 1; //get this month
        d1 = new Date(yr, my, dy);
    }

    return d1;
}

function getOverides()
{
    var uignoreErrors = false;
    var DebugFriday = false;
    return {
        uignoreErrors: uignoreErrors,
        DebugFriday: DebugFriday
    }
}


module.exports = {
    getD1,
    getOverides
};