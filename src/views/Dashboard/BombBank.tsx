import React, {useEffect} from 'react';
import styled from 'styled-components';

import {useParams} from 'react-router-dom';
import {useWallet} from 'use-wallet';
import {makeStyles} from '@material-ui/core/styles';

import {Box, Button, Card, CardContent, Typography, Grid} from '@material-ui/core';

import PageHeader from '../../components/PageHeader';
import Spacer from '../../components/Spacer';
import UnlockWallet from '../../components/UnlockWallet';
import Harvest from './componentsBank/Harvest';
import Stake from './componentsBank/Stake';
import useBank from '../../hooks/useBank';
import useStatsForPool from '../../hooks/useStatsForPool';
import useRedeem from '../../hooks/useRedeem';
import {Bank as BankEntity} from '../../bomb-finance';
import useBombFinance from '../../hooks/useBombFinance';
import {Alert} from '@material-ui/lab';
import useHarvest from '../../hooks/useHarvest';
import useEarnings from '../../hooks/useEarnings';
import useApprove, {ApprovalState} from '../../hooks/useApprove';
//import { bankDefinitions } from '../../config';

const useStyles = makeStyles((theme) => ({
  gridItem: {
    height: '100%',
    [theme.breakpoints.up('md')]: {
      height: '90px',
    },
  },
}));

const BombBank: React.FC = () => {
  useEffect(() => window.scrollTo(0, 0));
  const classes = useStyles();
  const bank = useBank("BombBtcbLPBShareRewardPool");
  const earnings = useEarnings(bank.contract, bank.earnTokenName, bank.poolId);
  const {account} = useWallet();
  const { onRedeem } = useRedeem(bank);
  const {onReward} = useHarvest(bank);
  let statsOnPool = useStatsForPool(bank);
  const [approveStatus, approve] = useApprove(bank.depositToken, bank.address);
  // console.log(statsOnPool);

  //   if (bank.depositTokenName.includes('80BOMB-20BTCB-LP') || bank.depositTokenName.includes('80BSHARE-20WBNB-LP')) {
  //     statsOnPool = {
  //       dailyAPR: 'COMING SOON',
  //       yearlyAPR: 'COMING SOON',
  //       TVL: 'COMING SOON',
  //     }
  //   } 
  
  
  //const statsOnPool = useStatsForPool(bank);
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
      <p>TVL: <span className='text-success'>${statsOnPool?.TVL}</span></p>
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

const LPTokenHelpText: React.FC<{bank: BankEntity}> = ({bank}) => {
  const bombFinance = useBombFinance();
  const bombAddr = bombFinance.BOMB.address;
  const bshareAddr = bombFinance.BSHARE.address;
    const busmAddr = bombFinance.BUSM.address;
  const busdAddr = bombFinance.BUSD.address;

  //const depositToken = bank.depositTokenName;
  //console.log({depositToken})
  let pairName: string;
  let uniswapUrl: string;
 // let vaultUrl: string;
  if (bank.depositTokenName.includes('BOMB-BTCB')) {
    pairName = 'BOMB-BTCB pair';
    uniswapUrl = 'https://pancakeswap.finance/add/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c/' + bombAddr;
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
    else if (bank.depositTokenName.includes('80BOMB-20BTCB-LP')) {
    pairName = 'BOMB MAXI 80% BOMB - 20% BTCB (at ACSI.finance)';
    uniswapUrl = 'https://app.acsi.finance/#/pool/0xd6f52e8ab206e59a1e13b3d6c5b7f31e90ef46ef000200000000000000000028/invest';
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
      else if (bank.depositTokenName.includes('80BSHARE-20WBNB-LP')) {
    pairName = 'BSHARE MAXI 80% BSHARE - 20% BNB (at ACSI.finance)';
    uniswapUrl = 'https://app.acsi.finance/#/pool/0x2c374ed1575e5c2c02c569f627299e902a1972cb000200000000000000000027/invest';
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
  else if (bank.depositTokenName.includes('BOMB-BSHARE')) {
    pairName = 'BOMB-BSHARE pair';
    uniswapUrl = 'https://pancakeswap.finance/add/' + bombAddr + '/' + bshareAddr;
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
      else if (bank.depositTokenName.includes('BUSM-BUSD')) {
    pairName = 'BUSM-BUSD pair';
    uniswapUrl = 'https://pancakeswap.finance/add/' + busmAddr + '/' + busdAddr;
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb';
  }
    
  else {
    pairName = 'BSHARE-BNB pair';
    uniswapUrl = 'https://pancakeswap.finance/add/BNB/' + bshareAddr;
 //   vaultUrl = 'https://www.bomb.farm/#/bsc/vault/bomb-bshare-bnb';

  }
  return (
    <Card>
      <CardContent>
        <StyledLink href={uniswapUrl} target="_blank">
          {`Provide liquidity for ${pairName} now!`}
        </StyledLink>
      </CardContent>
    </Card>
  );
};

const BankNotFound = () => {
  return (
    <Center>
      <PageHeader icon="🏚" title="Not Found" subtitle="You've hit a bank just robbed by unicorns." />
    </Center>
  );
};

const StyledBank = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledLink = styled.a`
  font-weight: 700;
  text-decoration: none;
  color: ${(props) => props.theme.color.primary.main};
`;

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`;

const Center = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default BombBank;
