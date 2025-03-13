export const getUser = async (req, res) => {
    res.status(200).send(req.user);
}