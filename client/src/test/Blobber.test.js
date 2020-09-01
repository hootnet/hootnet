const Blobber = require('../js/streamutils/Blobber');

test('Check Blobber initialization', () => {
  const blobber = new Blobber();
  expect(blobber.nBlobs).toBe(0);
});
