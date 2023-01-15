import React, { useMemo, useState } from 'react';
import { useWallet } from 'use-wallet';
import UnlockWallet from '../../components/UnlockWallet';
import moment from 'moment';
import Page from '../../components/Page';
import { createGlobalStyle } from 'styled-components';
import CountUp from 'react-countup';
import CardIcon from '../../components/CardIcon';
import TokenSymbol from '../../components/TokenSymbol';
import useBombStats from '../../hooks/useBombStats';
import useLpStats from '../../hooks/useLpStats';
import useLpStatsBTC from '../../hooks/useLpStatsBTC';
import useModal from '../../hooks/useModal';
import useZap from '../../hooks/useZap';
import useBondStats from '../../hooks/useBondStats';
import usebShareStats from '../../hooks/usebShareStats';
import useTotalValueLocked from '../../hooks/useTotalValueLocked';
import useRedeemOnBoardroom from '../../hooks/useRedeemOnBoardroom';
import useStakedBalanceOnBoardroom from '../../hooks/useStakedBalanceOnBoardroom';
import { getDisplayBalance } from '../../utils/formatBalance';
import useCurrentEpoch from '../../hooks/useCurrentEpoch';
import useFetchBoardroomAPR from '../../hooks/useFetchBoardroomAPR';
import useFetchBoardroomTVL from '../../hooks/useFetchBoardroomTVL';
import useCashPriceInEstimatedTWAP from '../../hooks/useCashPriceInEstimatedTWAP';
import useCashPriceInLastTWAP from '../../hooks/useCashPriceInLastTWAP';
import useTreasuryAllocationTimes from '../../hooks/useTreasuryAllocationTimes';
import useTotalStakedOnBoardroom from '../../hooks/useTotalStakedOnBoardroom';
import useClaimRewardCheck from '../../hooks/boardroom/useClaimRewardCheck';
import useWithdrawCheck from '../../hooks/boardroom/useWithdrawCheck';
import ProgressCountdown from './components/ProgressCountdown';
// import { Bomb as bombTesting } from '../../bomb-finance/deployments/deployments.testing.json';
//import { Bomb as bombProd } from '../../bomb-finance/deployments/deployments.mainnet.json';
import Harvest from './components/Harvest';
import Stake from './components/Stake';
import useHarvestFromBoardroom from '../../hooks/useHarvestFromBoardroom';
import useEarningsOnBoardroom from '../../hooks/useEarningsOnBoardroom';
import useApprove, {ApprovalState} from '../../hooks/useApprove';
import { roundAndFormatNumber } from '../../0x';
import MetamaskFox from '../../assets/img/metamask-fox.svg';
import { Box, Button, Card, CardContent, Grid, Paper } from '@material-ui/core';
import ZapModal from '../Bank/components/ZapModal';
import { Alert } from '@material-ui/lab';
import { IoCloseOutline } from 'react-icons/io5';
import { BiLoaderAlt } from 'react-icons/bi';
import { makeStyles } from '@material-ui/core/styles';
import useBombFinance from '../../hooks/useBombFinance';
//import { ReactComponent as IconTelegram } from '../../assets/img/telegram.svg';
import { Helmet } from 'react-helmet';
import BombImage from '../../assets/img/bomb.png';
import BombBTCImage from '../../assets/img/bomb-bitcoin-LP.png';
import BShareBNBImage from '../../assets/img/bshare-bnb-LP.png'
import BBondImage from '../../assets/img/bbond.png';
import BShareImage from '../../assets/img/bshares.png';
import MetaMask from '../../assets/img/metamask-fox.svg';
//import useBombMaxiStats from '../../hooks/useBombMaxiStats';
import HomeImage from '../../assets/img/background.jpg';
import BombBank from './BombBank';
import BShareBank from './BShareBank';
import BBondBank from './BBondBank';
import Bond from './Bond';
const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) repeat !important;
    background-size: cover !important;
    background-color: #171923;
  }
`;
const TITLE = 'bomb.money | BTC pegged algocoin';

const useStyles = makeStyles((theme) => ({
    button: {
      [theme.breakpoints.down('415')]: {
        // marginTop: '10px'
      },
    },
  }));

const Dashboard = () => {
    const classes = useStyles();
    const TVL = useTotalValueLocked();
    const bombFtmLpStats = useLpStatsBTC('BOMB-BTCB-LP');
    const bShareFtmLpStats = useLpStats('BSHARE-BNB-LP');
    const bombStats = useBombStats();
    const bShareStats = usebShareStats();
    const tBondStats = useBondStats();
    const bombFinance = useBombFinance();
    const { account } = useWallet();
    const { onRedeem } = useRedeemOnBoardroom();
    const stakedBalance = useStakedBalanceOnBoardroom();
    const currentEpoch = useCurrentEpoch();
    const cashStat = useCashPriceInEstimatedTWAP();
    const cashPrice = useCashPriceInLastTWAP();
    const totalStaked = useTotalStakedOnBoardroom();
    const boardroomAPR = useFetchBoardroomAPR();
    const boardroomTVL = useFetchBoardroomTVL();
    const canClaimReward = useClaimRewardCheck();
    const canWithdraw = useWithdrawCheck();
    const scalingFactor = useMemo(() => (cashStat ? Number(cashStat.priceInDollars).toFixed(4) : null), [cashStat]);
    const bondScale = (Number(cashPrice) / 100000000000000).toFixed(4); 
    const { to } = useTreasuryAllocationTimes();    
    const {onReward} = useHarvestFromBoardroom();
    const earnings = useEarningsOnBoardroom();
    const [approveStatus, approve] = useApprove(bombFinance.BSHARE, bombFinance.contracts.Boardroom.address);

    const buyBombAddress = //'https://app.1inch.io/#/56/swap/BTCB/BOMB';
    //  'https://pancakeswap.finance/swap?inputCurrency=0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c&outputCurrency=' +
    'https://app.bogged.finance/bsc/swap?tokenIn=0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c&tokenOut=0x522348779DCb2911539e76A1042aA922F9C47Ee3';
    //https://pancakeswap.finance/swap?outputCurrency=0x531780FAcE85306877D7e1F05d713D1B50a37F7A';
    const buyBShareAddress = //'https://app.1inch.io/#/56/swap/BNB/BSHARE';
        'https://app.bogged.finance/bsc/swap?tokenIn=BNB&tokenOut=0x531780FAcE85306877D7e1F05d713D1B50a37F7A';
    const buyBusmAddress =
        'https://app.bogged.finance/bsc/swap?tokenIn=0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56&tokenOut=0x6216B17f696B14701E17BCB24Ec14430261Be94A';
    const bombLPStats = useMemo(() => (bombFtmLpStats ? bombFtmLpStats : null), [bombFtmLpStats]);
    const bshareLPStats = useMemo(() => (bShareFtmLpStats ? bShareFtmLpStats : null), [bShareFtmLpStats]);
    const bombPriceInDollars = useMemo(
        () => (bombStats ? Number(bombStats.priceInDollars).toFixed(2) : null),
        [bombStats],
    );
    const bombPriceInBNB = useMemo(() => (bombStats ? Number(bombStats.tokenInFtm).toFixed(4) : null), [bombStats]);
    const bombCirculatingSupply = useMemo(() => (bombStats ? String(bombStats.circulatingSupply) : null), [bombStats]);
    const bombTotalSupply = useMemo(() => (bombStats ? String(bombStats.totalSupply) : null), [bombStats]);

    const bSharePriceInDollars = useMemo(
        () => (bShareStats ? Number(bShareStats.priceInDollars).toFixed(2) : null),
        [bShareStats],
    );
    const bSharePriceInBNB = useMemo(
        () => (bShareStats ? Number(bShareStats.tokenInFtm).toFixed(4) : null),
        [bShareStats],
    );
    const bShareCirculatingSupply = useMemo(
        () => (bShareStats ? String(bShareStats.circulatingSupply) : null),
        [bShareStats],
    );
    const bShareTotalSupply = useMemo(() => (bShareStats ? String(bShareStats.totalSupply) : null), [bShareStats]);

    const tBondPriceInDollars = useMemo(
        () => (tBondStats ? Number(tBondStats.priceInDollars).toFixed(2) : null),
        [tBondStats],
    );
    const tBondPriceInBNB = useMemo(() => (tBondStats ? Number(tBondStats.tokenInFtm).toFixed(4) : null), [tBondStats]);
    const tBondCirculatingSupply = useMemo(
        () => (tBondStats ? String(tBondStats.circulatingSupply) : null),
        [tBondStats],
    );
    const tBondTotalSupply = useMemo(() => (tBondStats ? String(tBondStats.totalSupply) : null), [tBondStats]);

    const bombLpZap = useZap({ depositTokenName: 'BOMB-BTCB-LP' });
    const bshareLpZap = useZap({ depositTokenName: 'BSHARE-BNB-LP' });

    const [onPresentBombZap, onDissmissBombZap] = useModal(
        <ZapModal
        decimals={18}
        onConfirm={(zappingToken, tokenName, amount) => {
            if (Number(amount) <= 0 || isNaN(Number(amount))) return;
            bombLpZap.onZap(zappingToken, tokenName, amount);
            onDissmissBombZap();
        }}
        tokenName={'BOMB-BTCB-LP'}
        />,
    );

    const [onPresentBshareZap, onDissmissBshareZap] = useModal(
        <ZapModal
        decimals={18}
        onConfirm={(zappingToken, tokenName, amount) => {
            if (Number(amount) <= 0 || isNaN(Number(amount))) return;
            bshareLpZap.onZap(zappingToken, tokenName, amount);
            onDissmissBshareZap();
        }}
        tokenName={'BSHARE-BNB-LP'}
        />,
    );

    const [modal, setModal] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);

    const openModal = () => {
        setModal(!modal);
    };

    const spinner = () => {
        setVideoLoading(!videoLoading);
    };
    return (
        <Page>
            <BackgroundImage />
            <div className='bg-dark'>
                <p className='text-center text-light m-0 p-3'>Bomb Finance Summary</p>
                <hr className='bg-light mt-0'/>
                <div className='d-flex row px-4 py-3'>
                    <div className='col-9 float-start'>
                    <table className="table text-light w-75">
                    <thead>
                        <tr>
                            <th scope="col"></th>
                            <th scope="col">Current Supply</th>
                            <th scope="col">Total Supply</th>
                            <th scope="col">Price</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th><img src={BombImage} className="rounded-circle bg-secondary" height={25} width={25}/> $BOMB</th>
                            <td>{bombCirculatingSupply}</td>
                            <td>{bombTotalSupply}</td>
                            <td><p className='m-0'>$ {bombPriceInDollars}</p><p className='m-0'>{bombPriceInBNB} BTCB</p></td>
                            <th><img src={MetaMask} height={40} width={40}/></th>
                        </tr>
                        <tr>
                            <th><img src={BShareImage} className="rounded-circle bg-secondary" height={25} width={25}/> $BSHARE</th>
                            <td>{bShareCirculatingSupply}</td>
                            <td>{bShareTotalSupply}</td>
                            <td><p className='m-0'>$ {bSharePriceInDollars}</p><p className='m-0'>{bSharePriceInBNB} BTCB</p></td>
                            <th><img src={MetaMask} height={40} width={40}/></th>
                        </tr>
                        <tr>
                            <th><img src={BBondImage} className="rounded-circle bg-secondary" height={25} width={25}/> $BBOND</th>
                            <td>{tBondCirculatingSupply}</td>
                            <td>{tBondTotalSupply}</td>
                            <td><p className='m-0'>$ {tBondPriceInDollars}</p><p className='m-0'>{tBondPriceInBNB} BTCB</p></td>
                            <th><img src={MetaMask} height={40} width={40}/></th>
                        </tr>
                    </tbody>
                    </table>
                    </div>
                    <div className='col-3 text-center text-light p-3'>
                        <p className='my-0'>Current Epoch<br/>
                        <h2 className='m-0'><ProgressCountdown base={moment().toDate()} hideBar={true} deadline={to} description="Next Epoch" /></h2></p>
                        <hr className='bg-light my-0'/>
                        <p className='my-0'><h2 className='m-0'>{Number(currentEpoch)}</h2>Next Epoch in</p>
                        <hr className='bg-light my-0'/>
                        <small className='my-0'>Live TWAP: <span className='text-success'>{scalingFactor}</span></small><br/>
                        <small className='my-0'>TVL: <span className='text-success'>${TVL.toFixed(0)}</span></small><br/>
                        <small className='my-0'>Last Epoch TWAP: <span className='text-success'>{bondScale}</span></small>
                    </div>
                </div>
            </div>
            <br/>
            <div className='d-flex row p-0 m-0 justify-content-between'>
                <div className='col-8 p-0'>
                    <a href="https://docs.bomb.money/welcome-start-here/strategies" target={"_blank"} style={{textDecoration:"underline"}}><p className='text-end text-primary'>Read Investment Strategy</p></a>
                    <a href="https://www.bombswap.xyz/swap" target="_blank" style={{textDecoration:"none"}}><p className='text-light p-3 text-center mt-3' style={{background:"linear-gradient(225.09deg, rgba(0, 232, 162, 0.5) 25.04%, rgba(0, 173, 232, 0.5) 94.09%)"}}><b>Invest Now</b></p></a>
                    <div className='d-flex row m-0 p-0 justify-content-between'>
                        <div className='col-6 m-0 p-0'>
                            <a href="https://discord.com/invite/94Aa4wSz3e" target={"_blank"} style={{textDecoration:"none"}}><p className='text-center text-light p-3 bg-secondary' style={{width:"98%"}}><b>Chat On Discord</b></p></a>
                        </div>
                        <div className='col-6 m-0 p-0'>
                            <a href="https://docs.bomb.money/" target={"_blank"} style={{textDecoration:"none"}}><p className='text-center text-light p-3 bg-secondary float-end' style={{width:"98%"}}><b>Read Docs</b></p></a>
                        </div> 
                    </div>
                    <div className='bg-dark p-3 m-0 text-light '>
                        <div className='row p-0 m-0'>
                            <img src={BShareImage} className="col-1 rounded-circle p-0 mt-2" height={60} width={60}/>
                            <div className='col-10'>
                                <p className='p-0 m-0'>Boardroom <span className='badge bg-success'>Recommended</span></p>
                                <small>Stake BSHARE and earn BOMB every epoch</small>
                                <p>TVL: <span className='text-success'>${boardroomTVL.toFixed(0)}</span><span className='mx-3'>|</span>Total Staked: <span className='text-success'>{getDisplayBalance(totalStaked)}</span></p>
                            </div>
                        </div>
                        <hr className='bg-light'/>
                        <div className='row p-0 m-0'>
                            <div className='col-2 p-0'><p className='m-0'>Daily Returns:</p><h1 className='m-0'>{(boardroomAPR/365).toFixed(2)}%</h1></div>
                            {!!account ? (
                                <>
                                    <div className='col-2 p-0'><p className='text-center m-0'>Your Stake:</p><p className='text-center m-0'><Stake /></p></div>
                                    <div className='col-2 p-0'><p className='text-center m-0'>Earned:</p><p className='text-center m-0'><Harvest /></p></div>
                                </>
                            ) : (
                                <UnlockWallet />
                            )}
                            <div className='col-6 p-0'>
                                <div className='row m-0 p-0'>
                                    <div className='col-6 p-0'>
                                        <Button
                                            disabled={approveStatus !== ApprovalState.NOT_APPROVED}
                                            className={approveStatus === ApprovalState.NOT_APPROVED ? 'shinyButton' : 'shinyButtonDisabled'}
                                            style={{width:"95%"}}
                                            onClick={approve}
                                            >
                                            Deposit
                                        </Button>
                                    </div>
                                    <div className='col-6 p-0 float-end'>
                                        <Button
                                                disabled={stakedBalance.eq(0) || (!canWithdraw && !canClaimReward)}
                                                onClick={onRedeem}
                                                className={
                                                stakedBalance.eq(0) || (!canWithdraw && !canClaimReward)
                                                    ? 'shinyButtonDisabledSecondary'
                                                    : 'shinyButtonSecondary'
                                                }
                                                style={{width:"100%"}}
                                            >
                                            Withdraw
                                        </Button>
                                    </div>
                                    <div className='col-12 p-0 mt-2'>
                                        <Button
                                                onClick={onReward}
                                                className={earnings.eq(0) || !canClaimReward ? 'shinyButtonDisabled' : 'shinyButton'}
                                                disabled={earnings.eq(0) || !canClaimReward}
                                                style={{width:"100%"}}
                                            >
                                            Claim Reward
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>  
                <div className='col-4 p-0'>
                    <div className='bg-dark float-end m-0' style={{width:"95%",height:"100%"}}>
                        <p className='text-light p-3'>Latest News...</p>
                    </div>
                </div>   
            </div>
            <br/>
            <div className='col-12 p-3 bg-dark text-light'>
                <p className='p-0 m-0'>Bomb Farms</p>
                <small>Stake your LP tokens in our farms to start earning $BSHARE</small>
                <div className='p-3'>
                    <div className='row p-0 m-0'>
                        <img src={BombBTCImage} className="col-1 rounded-circle p-0 mt-2" height={60} width={60}/>
                        <div className='col-11'>
                            <p className='p-0 m-0'>BOMB-BTCB <span className='badge bg-success'>Recommended</span></p>  
                            <BombBank/>
                        </div>
                    </div>
                </div>  
                <hr className='bg-light'/>
                <div className='p-3'>
                    <div className='row p-0 m-0'>
                        <img src={BShareBNBImage} className="col-1 rounded-circle p-0 mt-2" height={60} width={60}/>
                        <div className='col-11'>
                            <p className='p-0 m-0'>BSHARE-BNB <span className='badge bg-success'>Recommended</span></p>
                            <BShareBank/>
                        </div>
                    </div>
                </div> 
                <hr className='bg-light'/>
                <div className='p-3'>
                    <div className='row p-0 m-0'>
                        <img src={BBondImage} className="col-1 rounded-circle p-0 mt-2" height={60} width={60}/>
                        <div className='col-11'>
                            <p className='p-0 m-0'>BBOND <span className='badge bg-success'>Recommended</span></p>
                            <BBondBank/>
                        </div>
                    </div>
                </div> 
            </div> 
            <br/>
            <div className='col-12 p-3 bg-dark text-light'>
                <div className='row p-0 m-0'>
                    <img src={BBondImage} className="col-1 rounded-circle p-0" height={50} width={50}/>
                    <div className='col-11'>
                        <p className='p-0 m-0'>Bonds</p>
                        <p className='p-0 m-0'>BBOND can be purchased only on contraction periods, when TWAP of BOMB is below 1</p>
                    </div>
                </div>
                <hr className='bg-light'/>
                <Bond/>
            </div> 
        </Page>
    );
}

export default Dashboard;
