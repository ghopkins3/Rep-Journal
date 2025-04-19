export const getUser = async (req, res) => {
    console.log("User data:", req.user);
    res.status(200).send(req.user);
}