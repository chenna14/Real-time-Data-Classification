const { checkSentence } = require('../controllers/classificationController');
const Rule = require('../models/Rule'); // Ensure this path is correct

// Mock express request and response
const mockRequest = (body, user) => ({
  body,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('checkSentence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if sentence is not provided', async () => {
    const req = mockRequest({}, { id: 'user1' });
    const res = mockResponse();

    await checkSentence(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid input: sentence is required and must be a string' });
  });

  it('should return 400 if sentence is not a string', async () => {
    const req = mockRequest({ sentence: 123 }, { id: 'user1' });
    const res = mockResponse();

    await checkSentence(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid input: sentence is required and must be a string' });
  });

  it('should return 200 and validate sentence if all rules are satisfied', async () => {
    const req = mockRequest({ sentence: 'abc' }, { id: 'user1' });
    const res = mockResponse();

    // Mock Rule.find to return rules that the sentence satisfies
    Rule.find = jest.fn().mockResolvedValue([
      { condition: 'A <= 1' },
      { condition: 'B <= 1' },
      { condition: 'C <= 1' },
    ]);

    await checkSentence(req, res);

    expect(res.json).toHaveBeenCalledWith({ sentence: 'abc', allRulesSatisfied: true });
  });

  it('should return 400 and list failed rules if any rule is not satisfied', async () => {
    const req = mockRequest({ sentence: 'aaa' }, { id: 'user1' });
    const res = mockResponse();

    // Mock Rule.find to return rules that the sentence does not satisfy
    Rule.find = jest.fn().mockResolvedValue([
      { condition: 'A > 1' },
      { condition: 'B > 0' },
    ]);

    await checkSentence(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      sentence: 'aaa',
      allRulesSatisfied: false,
      failedRules: [{ condition: 'B > 0' }],
    });
  });

  it('should return 200 and validate sentence if all complex rules are satisfied', async () => {
    const req = mockRequest({ sentence: 'AAAABBBBCCCC' }, { id: 'user1' });
    const res = mockResponse();

    // Mock Rule.find to return complex rules that the sentence satisfies
    Rule.find = jest.fn().mockResolvedValue([
      { condition: '(A + B) > 10 && min(C, D) < 5' },
      { condition: 'max(E, F, G) > 3 && H == 1' },
      { condition: 'I < 2 && (J + K) == L' },
      { condition: 'M > N && min(O, P) >= 2' },
      { condition: '(Q - R) <= 3 && S > (T + U)' },
    ]);

    await checkSentence(req, res);

    expect(res.json).toHaveBeenCalledWith({ sentence: 'AAAABBBBCCCC', allRulesSatisfied: true });
  });

  it('should return 400 and list failed rules if any complex rule is not satisfied', async () => {
    const req = mockRequest({ sentence: 'AAABBBCCDD' }, { id: 'user1' });
    const res = mockResponse();

    // Mock Rule.find to return complex rules that the sentence does not satisfy
    Rule.find = jest.fn().mockResolvedValue([
      { condition: '(A + B) > 10 && min(C, D) < 5' }, // This rule fails because (A + B) = 6 and min(C, D) = 2
      { condition: 'max(E, F, G) > 3 && H == 1' },    // This rule fails because E, F, G, and H are not present
    ]);

    await checkSentence(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      sentence: 'AAABBBCCDD',
      allRulesSatisfied: false,
      failedRules: [
        { condition: '(A + B) > 10 && min(C, D) < 5' },
        { condition: 'max(E, F, G) > 3 && H == 1' },
      ],
    });
  });


  it('should return 500 if there is a server error', async () => {
    const req = mockRequest({ sentence: 'aaa' }, { id: 'user1' });
    const res = mockResponse();

    // Mock Rule.find to throw an error
    Rule.find = jest.fn().mockRejectedValue(new Error('Server error'));

    await checkSentence(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Server error');
  });
});
