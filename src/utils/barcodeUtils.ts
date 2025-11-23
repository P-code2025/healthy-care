import Quagga from '@ericblade/quagga2';

export const detectBarcodeWithQuagga = async (base64: string): Promise<string | null> => {
  return new Promise<string | null>((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('Quagga2 timeout after 8s');
      resolve(null);
    }, 8000);

    Quagga.decodeSingle(
      {
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'code_128_reader'],
        },
        locate: true,
        src: base64, 
        numOfWorkers: 0,
        inputStream: {
          size: 1600,
        },
      },
      (result) => {
        clearTimeout(timeout);
        if (result?.codeResult?.code) {
          console.log('BARCODE DETECTED:', result.codeResult.code);
          resolve(result.codeResult.code);
        } else {
          console.log('No barcode found');
          resolve(null);
        }
      }
    );
  });
};