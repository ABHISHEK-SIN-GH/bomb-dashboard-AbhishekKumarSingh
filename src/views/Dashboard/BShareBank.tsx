import React, {useEffect} from 'react';
import styled from 'styled-components';
import { roundAndFormatNumber } from '../../0x';
import {useWallet} from 'use-wallet';
import {Button, Card, CardContent} from '@material-ui/core';
import PageHeader from '../../components/PageHeader';
import UnlockWallet from '../../components/UnlockWallet';
import Harvest from './componentsBank/Harvest';
import Stake from './componentsBank/Stake';
import useBank from '../../hooks/useBank';
import useStatsForPool from '../../hooks/useStatsForPool';
import useRedeem from '../../hooks/useRedeem';
import useHarvest from '../../hooks/useHarvest';
import useEarnings from '../../hooks/useEarnings';
import useApprove, {ApprovalState} from '../../hooks/useApprove';

const BShareBank: React.FC = () => {
  useEffect(() => window.scrollTo(0, 0));
  const bank = useBank("BshareBnbLPBShareRewardPool");
  const earnings = useEarnings(bank.contract, bank.earnTokenName, bank.poolId);
  const {account} = useWallet();
  const { onRedeem } = useRedeem(bank);
  const {onReward} = useHarvest(bank);
  let statsOnPool = useStatsForPool(bank);
  const [approveStatus, approve] = useApprove(bank.depositToken, bank.address);
  
  let vaultUrl: string;
  if (bank.depositTokenName.includes('BOMB-BTCB')) {
    vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
  
   else if (bank.depositTokenName.includes('BOMB-BSHARE')) {
    vaultUrl = 'https://www.bomb.farm/#/bsc/';
  }
     else if (bank.depositTokenName.includes('BSHARE-BNB')) {
    vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bshare-wbnb';
  }

  return account && bank ? (
    <>
      <p>TVL: <span className='text-success'>${roundAndFormatNumber(parseFloat(statsOnPool?.TVL),0)}</span></p>
      <hr className='bg-light'/>
      <div className='row p-0 m-0'>
          <div className='col-2 p-0'><p className='m-0'>Daily Returns:</p><h1 className='0'>{bank.closedForStaking ? '0.00' : statsOnPool?.dailyAPR}%</h1></div>
          <div className='col-2 p-0'><p className='text-center m-0'>Your Stake:</p><p className='text-center m-0'><Harvest bank={bank}/></p></div>
          <div className='col-2 p-0'><p className='text-center m-0'>Earned:</p><p className='text-center m-0'><Stake bank={bank}/></p></div>
          <div className='col-6 p-0 d-flex align-items-center justify-content-center'>
              <div className='row m-0 p-0 w-100'>
                  <span className='col-4'>
                    <Button style={{width:"100%"}}
                      disabled={
                        bank.closedForStaking ||
                        approveStatus === ApprovalState.PENDING ||
                        approveStatus === ApprovalState.UNKNOWN
                      }
                      onClick={approve}
                      className={
                        bank.closedForStaking ||
                        approveStatus === ApprovalState.PENDING ||
                        approveStatus === ApprovalState.UNKNOWN
                          ? 'shinyButtonDisabled'
                          : 'shinyButton'
                      }
                    >
                      Deposit
                    </Button>
                  </span>
                  <span className='col-4'>              
                    <Button style={{width:"100%"}} onClick={onRedeem} className="shinyButtonSecondary">
                      Withdraw
                    </Button>
                  </span>
                  <span className='col-4'>
                    <Button style={{width:"100%"}}
                      onClick={onReward}
                      disabled={earnings.eq(0)}
                      className={earnings.eq(0) ? 'shinyButtonDisabled' : 'shinyButton'}
                    >
                      Claim Rewards
                    </Button>
                  </span>
              </div>
          </div>
      </div>
    </>
  ) : !bank ? (
    <BankNotFound />
  ) : (
    <UnlockWallet />
  );
};

const BankNotFound = () => {
  return (
    <Center>
      <PageHeader icon="🏚" title="Not Found" subtitle="You've hit a bank just robbed by unicorns." />
    </Center>
  );
};

const Center = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default BShareBank;
