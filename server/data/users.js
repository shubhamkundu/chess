class Users {
    constructor() {
        this.list = [];
    }

    getUser(id) {
        const user = this.list.find(u => u.id === id);
        if (!user) {
            return 'User not present!';
        }
        return user;
    }

    getTotalUserCount() {
        return this.list.length;
    }

    getUserCountByRoom(room) {
        const userList = this.list.filter(u => u.room === room);
        return userList.length;
    }

    addUser(id, name, room) {
        const userCountByRoom = this.getUserCountByRoom(room);
        const userToAdd = {
            id,
            name,
            room,
            team: userCountByRoom === 0 ? 'white' : 'black'
        };
        const user = this.list.find(u => u.id === userToAdd.id);
        if (user) {
            return 'User already present!';
        }
        this.list.push(userToAdd);
        console.log('users', this.list);
        return userToAdd;
    }

    // addUsers(users) {
    //     const addedUsers = [];
    //     const ignoredUsers = [];
    //     for (let i = 0; i < users.length; i++) {
    //         const userToAdd = users[i];
    //         const user = this.list.find(u => u.id === userToAdd.id);
    //         if (user) {
    //             userToAdd.ignoreReason = 'User already present!';
    //             ignoredUsers.push(userToAdd);
    //             continue;
    //         }
    //         this.list.push(userToAdd);
    //         addedUsers.push(userToAdd);
    //     }
    //     console.log('users', this.list);
    //     return {
    //         addedUsers,
    //         ignoredUsers
    //     }
    // }

    updateUser(id, updateObj) {
        const user = this.list.find(u => u.id === id);
        if (!user) {
            return 'User not present!';
        }
        for (const prop in updateObj) {
            if (updateObj.hasOwnProperty(prop)) {
                user.prop = updateObj[prop];
            }
        }
        console.log('users', this.list);
        return user;
    }

    removeUser(id) {
        const user = this.list.find(u => u.id === id);
        if (!user) {
            return 'User not present!';
        }
        this.list = this.list.filter(u => u.id !== id);
        console.log('users', this.list);
        return user;
    }
}

const users = new Users();

module.exports = {
    users
};