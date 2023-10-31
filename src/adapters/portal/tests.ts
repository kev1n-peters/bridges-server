import * as ethers from "ethers";
import adapter from ".";
import { EventData } from "../../utils/types";

const assertEqual = (expected: EventData, actual: EventData) => {
  for (const [key, expectedValue] of Object.entries(expected)) {
    // @ts-ignore
    const actualValue = actual[key];
    if (key === "amount" ? !(expectedValue as ethers.BigNumber).eq(actualValue) : expectedValue !== actualValue) {
      throw new Error(`${key}: expected ${expectedValue}, actual ${actualValue}`);
    }
  }
};

const getEvent = async (blockNumber: number, chain: string = "ethereum") => {
  const events = await adapter[chain](blockNumber, blockNumber + 1);
  if (events.length === 0) {
    throw new Error("no events found");
  }
  if (events.length > 1) {
    throw new Error("found more than one event");
  }
  return events[0];
};

const testNoEventsFound = async () => {
  const blockNumber = 18114747;
  const events = await adapter.ethereum(blockNumber, blockNumber + 1);
  if (events.length !== 0) {
    throw new Error("events should be empty");
  }
};

const testWrapAndTransferEth = async () => {
  // https://etherscan.io/tx/0x167803810b9274b3c35594a8a50928115141c7cbcc3f973d338ef71e1022729c
  const blockNumber = 18114746;
  const event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x167803810b9274b3c35594a8a50928115141c7cbcc3f973d338ef71e1022729c",
      from: "0x15E9dffFeC3f4E8cFC1b7C5770aa38709a712A3c",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      amount: ethers.BigNumber.from("1963000000000000000"),
      isDeposit: true,
    },
    event
  );
};

const testWrapAndTransferEthWithPayload = async () => {
  // https://etherscan.io/tx/0x632164812557f703f93c83bdc6ed4086583a505b8815f7db87b65473f6fccbfe
  let blockNumber = 18112187;
  let event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x632164812557f703f93c83bdc6ed4086583a505b8815f7db87b65473f6fccbfe",
      from: "0xc2A08ff99DF2dD45cA5cF5bc6636954f33294830",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      amount: ethers.BigNumber.from("30000000000000000"),
      isDeposit: true,
    },
    event
  );

  // https://etherscan.io/tx/0xd22e5849c63b4e17ec48aefbdbb4a659a6a516fa73f603c6791ec4780e23782e
  // relayer contract interaction
  blockNumber = 18093452;
  event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0xd22e5849c63b4e17ec48aefbdbb4a659a6a516fa73f603c6791ec4780e23782e",
      from: "0x072AFd05d41A2a9Ca0fa1755d7B79f861eDb04F3",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      amount: ethers.BigNumber.from("3600000000000000000"),
      isDeposit: true,
    },
    event
  );
};

const testTransferTokens = async () => {
  // https://etherscan.io/tx/0x45fb798f33f3501f43af1d9c312710bc102aa110d732a1ef3491b9f2d1ff8c82
  // native tokens
  let blockNumber = 18113848;
  let event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x45fb798f33f3501f43af1d9c312710bc102aa110d732a1ef3491b9f2d1ff8c82",
      from: "0xba4eeD5A9E6Acb87e298F6F11e278404f8da28df",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      amount: ethers.BigNumber.from("5000000000"),
      isDeposit: true,
    },
    event
  );
  // https://etherscan.io/tx/0x98ca80f521957c47dc70565c2760e2696edef9fc7e1c78b5a1ed39e4beabece9
  // wrapped tokens
  blockNumber = 18128505;
  event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x98ca80f521957c47dc70565c2760e2696edef9fc7e1c78b5a1ed39e4beabece9",
      from: "0xC8d5CF84E1aA38fFa9E5E532fc97b2F6e1C4740c",
      to: "0x0000000000000000000000000000000000000000",
      token: "0xE28027c99C7746fFb56B0113e5d9708aC86fAE8f",
      amount: ethers.BigNumber.from("1428672071062310"),
      isDeposit: true,
    },
    event
  );
};

const testTransferTokensWithPayload = async () => {
  // https://etherscan.io/tx/0xd32b1318b064b4859d2260ebcf116cc1c8687af374e43a83b52d7e059c8a76fb
  let blockNumber = 18115838;
  let event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0xd32b1318b064b4859d2260ebcf116cc1c8687af374e43a83b52d7e059c8a76fb",
      from: "0x6a0Ff6be57DdAbF9F5248a13d3D52e377E310c5d",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      amount: ethers.BigNumber.from("10000"),
      isDeposit: true,
    },
    event
  );

  // https://etherscan.io/tx/0x14aaac892b3d9cf9d95b1542861ce753213d1b602d4dadfd642687fad6226cdd
  // relayer contract interaction
  blockNumber = 18099846;
  event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x14aaac892b3d9cf9d95b1542861ce753213d1b602d4dadfd642687fad6226cdd",
      from: "0xdC382CDF2a25790F535a518EC26958c227e9DCF2",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      amount: ethers.BigNumber.from("9468893553"),
      isDeposit: true,
    },
    event
  );
};

const testCompleteTransferAndUnwrapEth = async () => {
  // https://etherscan.io/tx/0xd6acc39544697ba6fbd8b5878c246c63d72d71577931d6b65191125526cae185
  const blockNumber = 18470535;
  const event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0xd6acc39544697ba6fbd8b5878c246c63d72d71577931d6b65191125526cae185",
      from: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      to: "0xC75CCc563EABd2452E9DeC065207c706f612525f",
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      amount: ethers.BigNumber.from("1000000000000000000"),
      isDeposit: false,
    },
    event
  );
};

const testCompleteTransferAndUnwrapEthWithPayload = async () => {
  // https://etherscan.io/tx/0x905c9fa88ba16dff3ba529ddb59eb52d57cbce5702a39f4979cfdc4cec1e8b59
  const blockNumber = 18472422;
  const event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x905c9fa88ba16dff3ba529ddb59eb52d57cbce5702a39f4979cfdc4cec1e8b59",
      from: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      to: "0x7c99bcffA9E122b9d800bBFBb9B980238f7b6256",
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      amount: ethers.BigNumber.from("10000000000000"),
      isDeposit: false,
    },
    event
  );
};

const testCompleteTransfer = async () => {
  // https://etherscan.io/tx/0x33423dbffc3a0e9265a25fc951a3ac426acab373c26115f983c71ea8a2dcd0fd
  // wrapped tokens
  let blockNumber = 18471605;
  let event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x33423dbffc3a0e9265a25fc951a3ac426acab373c26115f983c71ea8a2dcd0fd",
      from: "0x0000000000000000000000000000000000000000",
      to: "0x155d1164FF74eaC667Dd2136Aee881A1381DC764",
      token: "0x418D75f65a02b3D53B2418FB8E1fe493759c7605",
      amount: ethers.BigNumber.from("12000000000000000000"),
      isDeposit: false,
    },
    event
  );

  // https://etherscan.io/tx/0xc56384ee885d5bca79bc03a7c69edd81ef5be9e152019c0a3ea5a8a5abbd3191
  // native tokens
  blockNumber = 18472153;
  event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0xc56384ee885d5bca79bc03a7c69edd81ef5be9e152019c0a3ea5a8a5abbd3191",
      from: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      to: "0x29A9BCc55D97Af5FE429ECe5372fc4d5541382b8",
      token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      amount: ethers.BigNumber.from("5000000000"),
      isDeposit: false,
    },
    event
  );
};

const testCompleteTransferWithPayload = async () => {
  // https://moonscan.io/tx/0x959ad1028e7d3cc687d1b24bf3ca52e868d9e04fc660bab56ae4b8f98dc89d4d
  // relayer contract interaction
  const blockNumber = 4769477;
  const event = await getEvent(blockNumber, "moonbeam");
  assertEqual(
    {
      blockNumber,
      txHash: "0x959ad1028e7d3cc687d1b24bf3ca52e868d9e04fc660bab56ae4b8f98dc89d4d",
      from: "0x0000000000000000000000000000000000000000",
      to: "0xCafd2f0A35A4459fA40C0517e17e6fA2939441CA",
      token: "0xd4937A95BeC789CC1AE1640714C61c160279B22F",
      amount: ethers.BigNumber.from("100000000000000000"),
      isDeposit: false,
    },
    event
  );
};

const testAvalanche = async () => {
  let blockNumber;
  let event;
  // https://snowtrace.io/tx/0x71f0028aacdb112eebfed0c45430aeb7ca7229da747c529f5a3cc59feb2e92c7
  // deposit native tokens
  blockNumber = 35173920;
  event = await getEvent(blockNumber, "avalanche");
  assertEqual(
    {
      blockNumber,
      txHash: "0x71f0028aacdb112eebfed0c45430aeb7ca7229da747c529f5a3cc59feb2e92c7",
      from: "0xd493066498aCe409059fDA4c1bCD2E73D8cffE01",
      to: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
      token: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      amount: ethers.BigNumber.from("10000000000000000"),
      isDeposit: true,
    },
    event
  );

  // https://snowtrace.io/tx/0x3841246c0c1f4aa9190cdacddcd3eac6d8bf10562fc2e2b4615484e0694394e6
  // deposit wrapped tokens
  blockNumber = 35174152;
  event = await getEvent(blockNumber, "avalanche");
  assertEqual(
    {
      blockNumber,
      txHash: "0x3841246c0c1f4aa9190cdacddcd3eac6d8bf10562fc2e2b4615484e0694394e6",
      from: "0x31eeE3D36b30E26e733B9e11f112c2cb87AbF618",
      to: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
      token: "0xDfDA518A1612030536bD77Fd67eAcbe90dDC52Ab",
      amount: ethers.BigNumber.from("14000000000000000000"),
      isDeposit: false,
    },
    event
  );

  // https://snowtrace.io/tx/0xb00c06347f56748c86e47641e3a9e825b442f8296deba4cd6821d1cebe3898d1
  // withdraw native tokens
  blockNumber = 37159795;
  event = await getEvent(blockNumber, "avalanche");
  assertEqual(
    {
      blockNumber,
      txHash: "0xb00c06347f56748c86e47641e3a9e825b442f8296deba4cd6821d1cebe3898d1",
      from: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
      to: "0xE6990c7e206D418D62B9e50c8E61f59Dc360183b",
      token: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      amount: ethers.BigNumber.from("10000"),
      isDeposit: false,
    },
    event
  );

  // https://snowtrace.io/tx/0x443c3b02029e76b948146e3d4313d5a5389f50f02fdd5eda6839090bdeb41239
  // withdraw wrapped tokens
  blockNumber = 37164693;
  event = await getEvent(blockNumber, "avalanche");
  assertEqual(
    {
      blockNumber,
      txHash: "0x443c3b02029e76b948146e3d4313d5a5389f50f02fdd5eda6839090bdeb41239",
      from: "0x0000000000000000000000000000000000000000",
      to: "0x06832B43186C6dEac394916B6583D6bE2D627520",
      token: "0x6F65Fa22e903122d274838F99840c9c1beE5F77c",
      amount: ethers.BigNumber.from("580069280"),
      isDeposit: false,
    },
    event
  );
};

const testOptimism = async () => {
  // https://optimistic.etherscan.io/tx/0x1254fa3ef00ccb593fa2e2917e13d06c1b0fb40683102cb1a1951c021d2fa64c
  // deposit native
  let blockNumber = 109289047;
  let event = await getEvent(blockNumber, "optimism");
  assertEqual(
    {
      blockNumber,
      txHash: "0x1254fa3ef00ccb593fa2e2917e13d06c1b0fb40683102cb1a1951c021d2fa64c",
      from: "0xEC3c8F8582AD5CA88e072F6c8cB2FE1BaAeDA4D0",
      to: "0x1D68124e65faFC907325e3EDbF8c4d84499DAa8b",
      token: "0x8B21e9b7dAF2c4325bf3D18c1BeB79A347fE902A",
      amount: ethers.BigNumber.from("42270000000000000000"),
      isDeposit: true,
    },
    event
  );

  // https://optimistic.etherscan.io/tx/0x0aceb4cdce1024236a0cce3ea7632dd26317fec421a3b6ca6baf398c46da79b2
  // deposit wrapped
  blockNumber = 109586447;
  event = await getEvent(blockNumber, "optimism");
  assertEqual(
    {
      blockNumber,
      txHash: "0x0aceb4cdce1024236a0cce3ea7632dd26317fec421a3b6ca6baf398c46da79b2",
      from: "0xbC631Fe26bF28fCcb65f72914cEE92fCEbfBdc23",
      to: "0x0000000000000000000000000000000000000000",
      token: "0xb4B9EEa94D20E8623CC2fb85661E7C94505D3490",
      amount: ethers.BigNumber.from("225000"),
      isDeposit: true,
    },
    event
  );

  // https://optimistic.etherscan.io/tx/0xd87456e0be2dc0e669c597324c7826a2095e227f33d42e706e20a908322ebd91
  // withdraw native
  blockNumber = 111588102;
  event = await getEvent(blockNumber, "optimism");
  assertEqual(
    {
      blockNumber,
      txHash: "0xd87456e0be2dc0e669c597324c7826a2095e227f33d42e706e20a908322ebd91",
      from: "0x1D68124e65faFC907325e3EDbF8c4d84499DAa8b",
      to: "0xFC397502e11b8e08935Df2295eCB8A79D2122975",
      token: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      amount: ethers.BigNumber.from("8125085"),
      isDeposit: false,
    },
    event
  );

  // https://optimistic.etherscan.io/tx/0xb8b98c2348124214aea4f062a0eecdedc3857f9a9d0a7e36f84895407358631e
  // withdraw wrapped
  blockNumber = 111576221;
  event = await getEvent(blockNumber, "optimism");
  assertEqual(
    {
      blockNumber,
      txHash: "0xb8b98c2348124214aea4f062a0eecdedc3857f9a9d0a7e36f84895407358631e",
      from: "0x0000000000000000000000000000000000000000",
      to: "0xB0fb231c58Ef465b720e8Bef705C0Cf0FB56572e",
      token: "0x6F974A6dfD5B166731704Be226795901c45Bb815",
      amount: ethers.BigNumber.from("6650000"),
      isDeposit: false,
    },
    event
  );
};

const testKlaytn = async () => {
  // https://scope.klaytn.com/tx/0xc93f8881c85c552043a7ceaccdf628b5375edf6c6d494c1fe004c692546b096f?tabId=eventLog
  // wrap and transfer
  let blockNumber = 132658037;
  let event = await getEvent(blockNumber, "klaytn");
  assertEqual(
    {
      blockNumber,
      txHash: "0xc93f8881c85c552043a7ceaccdf628b5375edf6c6d494c1fe004c692546b096f",
      from: "0xD23b97041B323176C8b595c85b9851b91922e2a9",
      to: "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
      token: "0xe4f05A66Ec68B54A58B17c22107b02e0232cC817",
      amount: ethers.BigNumber.from("100000000000000000"),
      isDeposit: true,
    },
    event
  );

  // https://scope.klaytn.com/tx/0x392082d7ba1d55529d572ce6c378f851ae85dac13531153ca919adbc6cde4095?tabId=eventLog
  // deposit native
  // approval after transfer event case
  blockNumber = 132737520;
  event = await getEvent(blockNumber, "klaytn");
  assertEqual(
    {
      blockNumber,
      txHash: "0x392082d7ba1d55529d572ce6c378f851ae85dac13531153ca919adbc6cde4095",
      from: "0x2558963300Eb939F5b0d96eF9a4377d2bEF553a6",
      to: "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
      token: "0xCd670d77f3dCAB82d43DFf9BD2C4b87339FB3560",
      amount: ethers.BigNumber.from("20788608176160000000000"),
      isDeposit: true,
    },
    event
  );

  // https://scope.klaytn.com/tx/0x1b5156ae6e4cbf20f1abe0e8f48c3ef1f7e475e1bb16f549357eb50749a85619?tabId=tokenTransfer
  // withdraw wrapped
  blockNumber = 136407845;
  event = await getEvent(blockNumber, "klaytn");
  assertEqual(
    {
      blockNumber,
      txHash: "0x1b5156ae6e4cbf20f1abe0e8f48c3ef1f7e475e1bb16f549357eb50749a85619",
      from: "0x0000000000000000000000000000000000000000",
      to: "0x5f3A2830b12b762C52e067ED9b8029aD612E27E7",
      token: "0x02bf054363Aa9Fc04af2eED80c926Bbf60aEd548",
      amount: ethers.BigNumber.from("9882420"),
      isDeposit: false,
    },
    event
  );
};

const testSui = async () => {
  // const events = await adapter["sui"](14_992_284, 16_081_978)
  // console.log(events.length)

  // complete_transfer_with_payload (wrapped)
  // https://suiexplorer.com/txblock/GWgFCab4BqtxXV2mFvMdM5deAkpKUPSqapT1AreoBh4Y
  let checkpoint = 15736900;
  let event = await getEvent(checkpoint, "sui");
  assertEqual(
    {
      blockNumber: checkpoint,
      txHash: "GWgFCab4BqtxXV2mFvMdM5deAkpKUPSqapT1AreoBh4Y",
      from: ethers.constants.AddressZero,
      to: "0xc4c610707eab9b222996b075f7d07c7d9b07766ab7bcafef621fd53bbf089f4e",
      token: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
      amount: ethers.BigNumber.from("34389000000"),
      isDeposit: false,
    },
    event
  );

  // complete_transfer (native)
  // https://suiexplorer.com/txblock/2XrjjNwGXPzEDdHztJ7kG6E9wijiWK8sfQczhoT1V38Q
  checkpoint = 16007453;
  event = await getEvent(checkpoint, "sui");
  assertEqual(
    {
      blockNumber: checkpoint,
      txHash: "2XrjjNwGXPzEDdHztJ7kG6E9wijiWK8sfQczhoT1V38Q",
      from: "0xc57508ee0d4595e5a8728974a4a93a787d38f339757230d441e895422c07aba9",
      to: "0xd5c67d73166147f6fec91717187651966cc15c5caec2462dbbe380f44b21e87f",
      token: "0x2::sui::SUI",
      amount: ethers.BigNumber.from("10000000"),
      isDeposit: false,
    },
    event
  );

  // transfer_tokens_with_payload (wrapped - not sent to origin chain)
  // https://suiexplorer.com/txblock/EqSqsc9pbo6hRgAhUyjn3nsKU51k6kEHd1v4DVBdvkyz
  checkpoint = 15827121;
  event = await getEvent(checkpoint, "sui");
  assertEqual(
    {
      blockNumber: checkpoint,
      txHash: "EqSqsc9pbo6hRgAhUyjn3nsKU51k6kEHd1v4DVBdvkyz",
      from: "0x161a9493ce468ee0fe56be02fe086eb47b650f76cbc8f7030a8f9b2bbcc7f3ac",
      to: "0xc57508ee0d4595e5a8728974a4a93a787d38f339757230d441e895422c07aba9",
      token: "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN",
      amount: ethers.BigNumber.from("1000000"),
      isDeposit: false,
    },
    event
  );

  // transfer_tokens (wrapped - sent to origin chain)
  // https://suiexplorer.com/txblock/2Dc96jf7PSJeA9kcLxUyTZMsSwsEtTDMrYdabqDpuZAS
  checkpoint = 16005422;
  event = await getEvent(checkpoint, "sui");
  assertEqual(
    {
      blockNumber: checkpoint,
      txHash: "2Dc96jf7PSJeA9kcLxUyTZMsSwsEtTDMrYdabqDpuZAS",
      from: "0xd5c67d73166147f6fec91717187651966cc15c5caec2462dbbe380f44b21e87f",
      to: ethers.constants.AddressZero,
      token: "0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8::coin::COIN",
      amount: ethers.BigNumber.from("1000000"),
      isDeposit: false,
    },
    event
  );

  // transfer_tokens (native)
  // https://suiexplorer.com/txblock/9ePHxgVdKFoYGnE4nMg3bxiShmYq9yuYKdENEtwDKVwm
  checkpoint = 15991909;
  event = await getEvent(checkpoint, "sui");
  assertEqual(
    {
      blockNumber: checkpoint,
      txHash: "9ePHxgVdKFoYGnE4nMg3bxiShmYq9yuYKdENEtwDKVwm",
      from: "0xbda9efe864e492f5921f30287a10f60287eafdcc82f259a39bb2335fb069a948",
      to: "0xc57508ee0d4595e5a8728974a4a93a787d38f339757230d441e895422c07aba9",
      token: "0x2::sui::SUI",
      amount: ethers.BigNumber.from("2100000000"),
      isDeposit: true,
    },
    event
  );

  console.log("sui tests passed");
};

(async () => {
  await Promise.all([
    testNoEventsFound(),
    testWrapAndTransferEth(),
    testWrapAndTransferEthWithPayload(),
    testTransferTokens(),
    testTransferTokensWithPayload(),
    testCompleteTransferAndUnwrapEth(),
    testCompleteTransferAndUnwrapEthWithPayload(),
    testCompleteTransfer(),
    testCompleteTransferWithPayload(),
    testAvalanche(),
    testOptimism(),
    testKlaytn(),
    // testSui(),
  ]);
})();
