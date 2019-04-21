module.exports = {
  setApiKey: () => {},
  send: () =>
    Promise.resolve([
      {
        toJSON: () => ({
          mock: "mocked response"
        })
      },
      {}
    ])
};
