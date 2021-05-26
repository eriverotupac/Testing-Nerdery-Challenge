import { Console } from 'console';
import faker from 'faker';
import fetch, { Response } from 'node-fetch';
import { mocked } from 'ts-jest/utils';
import {
  isInteger,
  toLowerCase,
  removeDuplicatesFromArray,
  createRandomProduct,
  getStarWarsPlanets,
  createProduct,
  createFakeProduct,
} from './index';

test('Test a value is integer', () => {
  expect(isInteger(8)).toBe(true);
  expect(isInteger('8')).toBe(false);
  expect(isInteger(null)).toBe(false);
  expect(isInteger(undefined)).toBe(false);
});

test('Given a string test that return is in lower case', () => {
  expect(toLowerCase('hello')).toBe('hello');
  expect(toLowerCase('BonjouR')).toBe('bonjour');
  expect(toLowerCase('')).toBe('Please provide a string');
  expect(toLowerCase(null)).toBe('Please provide a string');
  expect(toLowerCase(undefined)).toBe('Please provide a string');
});

test('remove duplicates of array', () => {
  const validArrayStrings = ['hello', 'hello', 'all', 'is', 'ok'];
  const validArrayInts = [13, 2, -5, 13];

  function removeDuplicates(array: (string | number)[]) {
    return array.reduce((acc: (string | number)[], next) =>
      (acc.indexOf(next) === -1 ? [...acc, next] : acc), []);
  }

  expect(() => {
    removeDuplicatesFromArray(undefined);
  }).toThrowError('please provide an array of numbers or strings');

  expect(() => {
    removeDuplicatesFromArray(null);
  }).toThrowError('please provide an array of numbers or strings');

  expect(removeDuplicatesFromArray([])).toEqual([]);
  expect(removeDuplicatesFromArray([3])).toEqual([3]);
  expect(removeDuplicatesFromArray(validArrayStrings)).toEqual(removeDuplicates(validArrayStrings));
  expect(removeDuplicatesFromArray(validArrayInts)).toEqual(removeDuplicates(validArrayInts));
})

describe('test to check a product is valid', () => {
  const validProducts = [
    { name: 'prod123', description: 'it is a good product for face', tags: ['a'], price: 75.04 },
    { name: 'p45', description: 'product for bath', tags: ['bc'], price: 23.40 },
    { name: 'pro55', description: 'product with natural products', tags: ['b'], price: 15.34 }
  ];
  const inValidProducts = [
    { name: 'p3', description: 'it is a good product for face and can help to regenerate the skin', price: 75.034, tags: ['ab, bc'] },
    { name: '3345', description: 'pr', price: 23.40, tags: ['arf'] },
    { name: '&%', description: '12', price: -15.34, tags: ['b, c', 'd5'] },
    { name: '23%', description: '1', price: -1.34, tags: ['b, c', 'd5'] }
  ];

  validProducts.forEach(x =>
    test(`valid products ${x}`, () => {
      faker.datatype.number = jest.fn(() => 1);
      expect(createProduct(x)).toEqual({
        id: faker.datatype.number(),
        ...x
      })
    }));

  inValidProducts.forEach(x =>
    test(`not valid products ${x}`, () => {
      expect(() => {
        createProduct(x);
      }).toThrowError()
    }));
});


test('create a product', () => {
  const returnedProduct = {
    id: 12,
    name: 'cotton in bag',
    description: 'is soft for your skin',
    price: 13.3,
    tags: ['natural', 'white']
  }
  faker.datatype.number = jest.fn(() => 12);
  faker.commerce.productName = jest.fn(() => 'cotton in bag');
  faker.commerce.productDescription = jest.fn(() => 'is soft for your skin');
  faker.commerce.price = jest.fn(() => 13.3);
  faker.commerce.productMaterial = jest.fn(() => 'natural');
  faker.commerce.color = jest.fn(() => 'white');

  expect(createFakeProduct()).toEqual(returnedProduct);
})


describe(`only create a fake product when the role is creator`, () => {
  const emailRoleCreator = 'clark@kent.com';
  const emailNotRoleCreator = ['bruce@wayne.com', 'diana@themyscira.com'];

  emailNotRoleCreator.forEach(x =>
    test(`not creator user email ${x}`, () => {
      expect(() => {
        createRandomProduct(x)
      }).toThrowError('You are not allowed to create products');
    })
  );
  const objectToBeMatched = {
    id: expect.any(Number),
    name: expect.any(String),
    description: expect.any(String),
    price: expect.any(Number),
    tags: expect.any(Array)
  }
  test('creator user mail', () => {
    jest.clearAllMocks();
    expect(createRandomProduct(emailRoleCreator)).toMatchObject(objectToBeMatched);
  });
})

const responseStarWars = {
  count: 50,
  next: "http://swapi.dev/api/planets/?page=2",
  previous: null,
  results: ["many values"]
};

jest.mock('node-fetch', () => {
  return jest.fn();
});

beforeEach(() => {
  mocked(fetch).mockClear();
})

test('get planets of Star Wars', async () => {
  mocked(fetch).mockImplementationOnce((): Promise<any> => {
    return Promise.resolve({
      json() {
        return Promise.resolve(responseStarWars);
      }
    });
  });
  const planets = await getStarWarsPlanets();
  expect(mocked(fetch).mock.calls.length).toBe(1);
  expect(planets).toBeDefined();
  expect(planets.count).toBe(50);
});

test('get error when getting planets of Star Wars', async () => {
  try {
    mocked(fetch).mockImplementationOnce(() => Promise.reject());
    await getStarWarsPlanets();
  } catch (error) {
    expect(error.message).toEqual('unable to make request');
  }
});

