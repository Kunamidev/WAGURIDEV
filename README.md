# Rona Bot - 🤖

![Rona Bot](https://i.imgur.com/n9QB3at.jpeg)

## Author
**Jay Mar**

## Command Configuration

### Config Parameters:
- **name**: The name of the command (`example_command`).
- **description**: A brief description of the command functionality.
- **usage**: How the command is used (`example_command [usage]`).
- **cooldown**: The cooldown period (in seconds) before the command can be reused by the same user.
- **role**: User role required to execute the command (`0` for everyone).
- **prefix**: Whether the command requires a prefix (`false` for no prefix).

## Example Hi Command:
```javascript
module.exports = {
  // Command configuration
  config: {
    name: "hi", // The name of the command
    description: "Sends a greeting message", // A brief description of what the command does
    usage: "hi", // How to use the command
    cooldown: 5, // The cooldown time in seconds
    prefix: false, // Whether the command requires a prefix (false = no prefix required)
    role: 0, // Role required to use the command (0 = everyone can use it)
  },

  // The function that executes when the command is triggered
  run: async (api, event, args, reply, react) => {
    // React to the message with an emoji
    react("👋", event);

    // Send a reply message back to the user
    reply("Hello! How can I assist you today?", event);
  },
};
