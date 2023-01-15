import React, {useCallback, useMemo} from 'react';
import Page from '../../components/Page';
import {createGlobalStyle} from 'styled-components';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import ExchangeCard from './componentsBond/ExchangeCard';
import styled from 'styled-components';
import Spacer from '../../components/Spacer';
import useBondStats from '../../hooks/useBondStats';
//import useBombStats from '../../hooks/useBombStats';
import useBombFinance from '../../hooks/useBombFinance';
import useCashPriceInLastTWAP from '../../hooks/useCashPriceInLastTWAP';
import {useTransactionAdder} from '../../state/transactions/hooks';
import ExchangeStat from './componentsBond/ExchangeStat';
import useTokenBalance from '../../hooks/useTokenBalance';
import useBondsPurchasable from '../../hooks/useBondsPurchasable';
import {getDisplayBalance} from '../../utils/formatBalance';
import { BOND_REDEEM_PRICE, BOND_REDEEM_PRICE_BN } from '../../bomb-finance/constants';
import { Alert } from '@material-ui/lab';


import HomeImage from '../../assets/img/background.jpg';
import { Grid, Box } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import ExchangeCardBtn from './componentsBond/ExchangeCardBtn';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) repeat !important;
    background-size: cover !important;
    background-color: #171923;
  }
`;
const TITLE = 'bomb.money | Bonds'

const Bond: React.FC = () => {
  const {path} = useRouteMatch();
  const bombFinance = useBombFinance();
  const addTransaction = useTransactionAdder();
  const bondStat = useBondStats();
  //const bombStat = useBombStats();
  const cashPrice = useCashPriceInLastTWAP();

  const bondsPurchasable = useBondsPurchasable();

  const bondBalance = useTokenBalance(bombFinance?.BBOND);
  //const scalingFactor = useMemo(() => (cashPrice ? Number(cashPrice) : null), [cashPrice]);

  const handleBuyBonds = useCallback(
    async (amount: string) => {
      const tx = await bombFinance.buyBonds(amount);
      addTransaction(tx, {
        summary: `Buy ${Number(amount).toFixed(2)} BBOND with ${amount} BOMB`,
      });
    },
    [bombFinance, addTransaction],
  );

  const handleRedeemBonds = useCallback(
    async (amount: string) => {
      const tx = await bombFinance.redeemBonds(amount);
      addTransaction(tx, {summary: `Redeem ${amount} BBOND`});
    },
    [bombFinance, addTransaction],
  );
  const isBondRedeemable = useMemo(() => cashPrice.gt(BOND_REDEEM_PRICE_BN), [cashPrice]);
  const isBondPurchasable = useMemo(() => Number(bondStat?.tokenInFtm) < 1.01, [bondStat]);
  const isBondPayingPremium = useMemo(() => Number(bondStat?.tokenInFtm) >= 1.1, [bondStat]);
// console.log("bondstat", Number(bondStat?.tokenInFtm))
  const bondScale = (Number(cashPrice) / 100000000000000).toFixed(4); 

  return (
    <>
        <div className='row p-0 m-0 d-flex justify-content-between'>
            <div className='col-3 p-0'><p className='text-start m-0'>Current Price: (Bomb)^2</p>
                <h5 className='text-start m-0'>BBond = 
                    <ExchangeStat
                        tokenName="10,000 BBOND"
                        description="Current Price: (BOMB)^2"
                        price={Number(bondStat?.tokenInFtm).toFixed(4) || '-'}
                    /> 
                </h5>
            </div>
            <div className='col-2 p-0'><p className='text-center m-0'>Available to Purchase:</p>
                <h5 className='text-center m-0'>
                    <ExchangeCard
                        action="Purchase"
                        fromToken={bombFinance.BOMB}
                        fromTokenName="BOMB"
                        toToken={bombFinance.BBOND}
                        toTokenName="BBOND"
                        priceDesc={
                        !isBondPurchasable
                            ? 'BOMB is over peg'
                            : getDisplayBalance(bondsPurchasable, 18, 4) + ' BBOND'
                        }
                        onExchange={handleBuyBonds}
                        disabled={!bondStat || isBondRedeemable}
                    />
                </h5>
            </div>
            <div className='col-2 p-0'><p className='text-center m-0'>Available to Redeem:</p>
                <h5 className='text-center m-0'>
                    <ExchangeCard
                        action="Redeem"
                        fromToken={bombFinance.BBOND}
                        fromTokenName="BBOND"
                        toToken={bombFinance.BOMB}
                        toTokenName="BOMB"
                        priceDesc={`${getDisplayBalance(bondBalance)} BBOND`}
                        onExchange={handleRedeemBonds}
                        disabled={!bondStat || bondBalance.eq(0) || !isBondRedeemable}
                        disabledDescription={!isBondRedeemable ? `Enabled when 10,000 BOMB > ${BOND_REDEEM_PRICE} BTC` : null}
                    />
                </h5>
            </div>
            <div className='col-5 p-0 d-flex align-items-center justify-content-end'>
                <div className='row m-0 p-0 w-75'>
                    <span className='col-6'>
                        <ExchangeCardBtn
                            action="Purchase"
                            fromToken={bombFinance.BOMB}
                            fromTokenName="Purchase BOMB"
                            toToken={bombFinance.BBOND}
                            toTokenName="BBOND"
                            priceDesc={!isBondPurchasable ? 'BOMB is over peg' : getDisplayBalance(bondsPurchasable, 18, 4) + ' BBOND'}
                            onExchange={handleBuyBonds}
                            disabled={!bondStat || isBondRedeemable}
                        />
                    </span>
                    <span className='col-6'> 
                        <ExchangeCardBtn
                            action="Redeem"
                            fromToken={bombFinance.BBOND}
                            fromTokenName="Redeem BBOND"
                            toToken={bombFinance.BOMB}
                            toTokenName="BOMB"
                            priceDesc={`${getDisplayBalance(bondBalance)} BBOND`}
                            onExchange={handleRedeemBonds}
                            disabled={!bondStat || bondBalance.eq(0) || !isBondRedeemable}
                            disabledDescription={!isBondRedeemable ? `Redeem BBond` : null}
                        />   
                    </span>
                </div>
            </div>
        </div>  
    </>
  );
};

const StyledBond = styled.div`
  display: flex;
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

const StyledStatsWrapper = styled.div`
  display: flex;
  flex: 0.8;
  margin: 0 20px;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 80%;
    margin: 16px 0;
  }
`;

export default Bond;
