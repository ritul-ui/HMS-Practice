import User from '../models/user.js';
import DoctorToken from '../models/doctortokens.js';

export const addDoctors = async (req, res) => {
    const listOfDoctors = req.body.listOfDoctors;
    console.log("list", listOfDoctors);
    for (let i=0; i<listOfDoctors.length; i++) {
        const doctor = listOfDoctors[i];
        const { username, email, password, description, mobile } = doctor;
        // create a user object
        const user = new User({
            username,
            email,
            password,
            type: 'doctor',
            description,
            mobile
        });
        await user.save();
        // create a doctor token object

        const tokens = [... description.split(' '), ... username.split(' ')];
        const doctorToken = new DoctorToken({
            doctorId: user._id,
            token: tokens
        });
        console.log("doctor token", doctorToken);
        await doctorToken.save();
    }
    res.status(200).json({ message: 'Doctors added successfully' });
};

export const addTokensForAllDoctors = async (req, res) => {
    const doctors = await User.find({ type: 'doctor' });
    console.log("doctors", doctors);
    for (let i=0; i<doctors.length; i++) {
        const doctor = doctors[i];
        const doctorTokenPresent = await DoctorToken.findOne({ doctorId: doctor._id });
        console.log("doctorTokenPresent", doctorTokenPresent);
        // if the doctor token is already present, then I will not create a new one
        if (doctorTokenPresent) {
            continue;
        }
        const tokens = [... doctor.description.toLowerCase().split(' '), ... doctor.username.toLowerCase().split(' ')];
        console.log("doctor token", tokens);
        const doctorToken = new DoctorToken({
            doctorId: doctor._id,
            token: tokens
        });
        await doctorToken.save();
    }
    res.status(200).json({ message: 'Tokens added successfully' });
}

export const searchDoctors = async (req, res) => { // 
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Please provide a search term' });
    }
    const searchTokens = query.toLowerCase().split(' ');
    const tokenMatchingScores = [];
    const doctorTokens = await DoctorToken.find();
    for (let i=0; i<doctorTokens.length; i++) {
        console.log("doctorTokens", doctorTokens[i]);
        const doctorToken = doctorTokens[i];
        const tokens = doctorToken.token;
        let score = 0;
        for (let j=0; j<searchTokens.length; j++) {
            const searchToken = searchTokens[j];
            console.log("searchToken", searchToken);
            console.log("tokens", tokens);
            if (tokens.includes(searchToken)) {
                console.log("searchToken", searchToken);
                score++;
            }
        }
        tokenMatchingScores.push({ doctorId: doctorToken.doctorId, score });
    }
    tokenMatchingScores.sort((a, b) => b.score - a.score);
    console.log("tokenMatchingScores", tokenMatchingScores);
    const doctors = [];
    for (let i=0; i<tokenMatchingScores.length; i++) {
        if (tokenMatchingScores[i].score!== 0) {
            console.log("doctorId", tokenMatchingScores[i].doctorId);
            const doctor = await User.findById(tokenMatchingScores[i].doctorId);
            doctors.push(doctor);
        }
    }
    res.status(200).json(doctors);
}