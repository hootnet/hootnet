import Blobber from 'streamutils/Blobber';

test('Create Blobber', () => {

  Object.defineProperty(window, 'MediaRecorder', {
      writable: true,
      value: class {
          constructor(stream, options) {
            this.stream = stream;
            this.options = options;
          }
          static isTypeSupported = () => jest.fn()
          onstop = () => jest.fn()
      }
  });

  const blob = new Blobber();
});
