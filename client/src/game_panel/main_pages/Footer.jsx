import React, { Component } from 'react';
import { connect } from 'react-redux';
import history from '../../redux/history';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faTelegram, faDiscord } from '@fortawesome/free-brands-svg-icons';
import bscscan from '../icons/bscscan.png';
import busd from '../icons/b-usd.png';
import btc from '../icons/btc.png';
import eth from '../icons/eth.png';
import ltc from '../icons/ltc.png';
import { withStyles } from '@material-ui/core/styles';
import PrivacyModal from '../modal/PrivacyModal'
import TermsModal from '../modal/TermsModal';

const styles = (theme) => ({
    root: {
        width: '150px',
        padding: '8px 15px',
    },
    footerContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#747f8d',
        fontSize: '0.7rem',
        fontWeight: '500',
        padding: '40px 20px 10px',
        bottom: 0,
        left: 0,
        width: props => props.open ? 'calc(100vw - 275px)' : 'calc(100vw - 20px)',
        zIndex: 2,
    },
    address: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        fontWeight: '400',
        margin: '30px 0 20px',
        textTransform: 'capitalize'
    },
    links: {
        display: 'flex',
        alignItems: 'flex-end'
    },
    link: {
        marginTop: '10px',
        color: '#b9bbbe'
    },
    link: {
        marginTop: '10px',
        color: '#b9bbbe',
        '&:hover': {
            color: '#b9bbbe',
            textDecoration: 'none'
        },
    },
    proof: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '30px',
        lineHeight: '0',
        textAlign: 'center',
    },
    bscscan: {
        width: '25%',
    },
    currencies: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '210px',
        margin: '15px 0 0',
    },
    currency: {
        width: '42px',
        opacity: '0.2',
        filter: 'grayscale(100%)',
    },
    availableCurrency: {
        width: '42px',
        filter: 'none',
    },
});

class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: this.props.open,
            showPrivacyModal: false,
            showTermsModal: false,
        }
    }

    static getDerivedStateFromProps(props, current_state) {
        return null;
    }

    componentDidMount() {
        // this.IsAuthenticatedReroute();
    }
    
    IsAuthenticatedReroute = () => {
        if (!this.props.auth) {
            history.push('/');
        }
    };

    
  handleOpenTermsModal = () => {
    this.setState({ showTermsModal: true });
  };
  handleCloseTermsModal = () => {
    this.setState({ showTermsModal: false });
  };

  handleOpenPrivacyModal = () => {
    this.setState({ showPrivacyModal: true, anchorEl: null });
  };
  handleClosePrivacyModal = () => {
    this.setState({ showPrivacyModal: false });
  };


    render() {
        const { classes } = this.props;
        return (
            <div className="bottom-footer" style={this.props.style}>
                <div id="footer-container" className={classes.footerContainer}>
                <div className="social-icons">
                    <a href="https://discord.gg/anMJntW4AD">
                        <FontAwesomeIcon icon={faDiscord} />
                    </a>
                    <a href="https://twitter.com/officialrpsgame">
                        <FontAwesomeIcon icon={faTwitter} />
                    </a>
                    <a href="https://t.me/rpsfinance">
                        <FontAwesomeIcon icon={faTelegram} />
                    </a>
                    {/* <a href="https://www.youtube.com/@rps_game/">
                        <FontAwesomeIcon icon={faYoutube} />
                    </a>
                    <a href="https://www.instagram.com/rps.game/">
                        <FontAwesomeIcon icon={faInstagram} />
                    </a>
                    <a href="https://www.twitch.tv/rpsbet">
                        <FontAwesomeIcon icon={faTwitch} />
                    </a> */}
                </div>
                <div className={classes.currencies}>
    <img className={classes.availableCurrency} src={busd} alt="BUSD" />
    <img className={classes.currency} src={btc} alt="BTC" />
    <img className={classes.currency} src={eth} alt="ETH" />
    <img className={classes.currency} src={ltc} alt="LTC" />
</div>
                <div className={classes.proof}>
                    <p>Proof of Funds</p>
                    <a target="_blank" href="https://bscscan.com/address/0x5D38080DA6a868b8BBe65a061D79E2065d5Dd79A">

                <img  className={classes.bscscan} src={bscscan} alt="bscscan" />
                    </a>

                              </div>
                <div className={classes.links}>
                {/* <a className={classes.link} href="#">Contact</a>&nbsp;✗&nbsp; */}
                    {/* <a className={classes.link} href="#">Blog</a>&nbsp;✗&nbsp; */}
                    {/* <a className={classes.link} href="#">Faq</a>&nbsp;✗&nbsp; */}
                    <a className={classes.link}
                    href="#terms"
                    id="terms"
                    onClick={this.handleOpenTermsModal}
                    >
                        Terms
                    </a>&nbsp;✗&nbsp;
                    <a className={classes.link}
                        href="#privacy"
                        id="privacy"
                        onClick={this.handleOpenPrivacyModal}
                    >
                        Privacy
                    </a>
                    {/* <a className={classes.link} href="#">Fair</a> */}
                </div>
                <div className={classes.address}>
                    <p>RPS.GAME is operated by RPSBET Ltd. (Registration No. 12175962), having its registered address at 84 Ladysmith Road, Plymouth, UK
</p>
                    <p>Payments may be handled on behalf of RPS Finance Limited (UK) (Registration No. 13823533), having its registered address at 84 Ladysmith Road, Plymouth, UK
</p>
                </div>
            </div>
            {this.state.showTermsModal && (
            <TermsModal
              modalIsOpen={this.state.showTermsModal}
              closeModal={this.handleCloseTermsModal}
              isDarkMode={this.props.isDarkMode}
            />
          )}
          {this.state.showPrivacyModal && (
            <PrivacyModal
              modalIsOpen={this.state.showPrivacyModal}
              closeModal={this.handleClosePrivacyModal}
              isDarkMode={this.props.isDarkMode}
            />
          )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
  auth: state.auth.isAuthenticated,
  user_id: state.auth.user._id,
  isDarkMode: state.auth.isDarkMode,
});

const mapDispatchToProps = {
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles, { withTheme: true })(Footer));
