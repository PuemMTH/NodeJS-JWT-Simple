module.exports.check = async function(req, res, next) {
    await db.query("SELECT * FROM `logs`", function(err, result) {
        if (err) throw err;
        result.forEach(() => {
            // console.log(result);
        });
    });
    // next();
}