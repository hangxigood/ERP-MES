const bcrypt = require('bcrypt');

async function checkPassword() {
    const result = await bcrypt.compare('WantSleepSMI', '$2b$10$fE4Z8fbzLzX.asdNXI83GOht3bZFjwv9L1ioCP5UYQce/Scph3Ws6');
    console.log('Password match:', result);
}

checkPassword();