import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

// CRA's older jsdom does not provide the web APIs required by React Router 7.
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
