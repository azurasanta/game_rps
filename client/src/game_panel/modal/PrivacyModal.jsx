import React, { Component } from 'react';
import Modal from 'react-modal';
import { Button } from '@material-ui/core';

Modal.setAppElement('#root')

const customStyles = {
    overlay: {
		zIndex: 3,
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
	},
	content: {
		top         : '50%',
		left        : '50%',
		right       : 'auto',
		bottom      : 'auto',
		transform   : 'translate(-50%, -50%)',
		background: 'transparent',
		padding: 0,
	}
}

class PrivacyModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showPrivacyModal: false
        }
    }

    handleOpenPrivacyModal = () => {
        this.setState({ showPrivacyModal: true });
    }

    componentDidMount() {
    }

    render() {
        return <Modal
            isOpen={this.props.modalIsOpen}
            onRequestClose={this.props.closeModal}
            style={customStyles}
            contentLabel="Privacy Modal"
        >
            <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
                <div className='modal-header'>
					<h2 className="modal-title">Privacy <span style={{color: "#d81719"}}>RPS</span><span style={{color: "#ebddca"}}>Game</span></h2>
					<Button className="btn-close" onClick={this.props.closeModal}>×</Button>
                </div>
				<div className="modal-body edit-modal-body terms-modal-body">
                    <div>
                        <h2>Privacy Policy</h2>
                        <br/>
                        <h5>Last updated: 2nd March 2023</h5>
                        <br/>
                        “RPS GAME,” ("us", "we", or "our") operates https://rps.game (the "Site"). This page informs you of our policies regarding the collection, use and disclosure of Personal Information we receive from users of the Site. We use your Personal Information only for providing and improving the Site. By using the Site, you agree to the collection and use of information in accordance with this policy. If you do not want RPS Game to collect, store, use, or share your information in the ways described in this Privacy Policy, you may not play RPS Game games or use RPS Game’s other Services. For purposes of data protection laws, RPS Game is the “data controller” of your personal information.
                        <br/><br/>
                        <h5>Information Collection And Use</h5>
                        While using our Site, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. This only includes your email address. Personally identifiable information may include, but is not limited to your name ("Personal Information"). We do not collect payment details as this is done through third-party payment merchants including PayPal (https://www.paypal.com/) and Stripe (https://.stripe.com/).
                        <br/><br/>
                        <h5>Payment Information</h5>
                        We’ll collect information related to any bets you make. For all bets on rps.game, our third-party payment processor will collect the billing and financial information it needs to process your charges. This may include your postal address, email address, and financial information. RPS Game’s payment processors do not share your financial information, like credit card numbers, with RPS Game, but they may share non-financial information with us related to your purchases, like your billing address, and the amount paid. For outgoing payments (‘Winnings’), we may collect your account-specific payment details in order to process payments to you.
                        <br/><br/>
                        <h5>Customer Support Correspondence</h5>
                        We’ll keep a record of any correspondence between us. When you ask for help from our Customer Support team, we will collect and store the contact information you give them (generally just your email address), information about your game play or activity on our Services, and your RPS Game username and/or social network ID number. We will also store the communications you have with our Customer Service team and any additional information in those communications in order to provide support and improve the Services.
                        <br/><br/>
                        Information About You That We Get From Connected Third-Party Applications, Including Social Networks
                        We’ll collect some information from other companies, including social networks, if you access our games through your accounts with those companies or you choose to connect your accounts with those companies to our games. If you play RPS Game or access any of our other Services on connected third-party applications or connect our Services to any third-party applications, including social networks like Facebook, RPS Game may receive certain information about you from the provider of the third-party application. For example, RPS Game may collect and store some or all of the following information from the provider of the connected third-party application: your profile picture or its URL; your user identification number (like your Facebook ID number), which may be linked to the e-mail address you provided to that third-party application; If you are unclear about what information a third-party application is sharing with us, please go to the third-party application to find out more about their privacy practices.
                        <br/><br/>
                        <h5>Cookies and Other Automated Information Collection</h5>
                        We’ll collect information about your device and how you use our Services, including using cookies. As further described in our Cookie Notice, we use cookies to recognize you and/or your device(s) on, off, and across different Services and devices. We also allow others to use cookies and similar technologies as described in our Cookie Notice. You can control or opt out of the use of cookies and similar technologies that track your behavior on the sites of others for third-party advertising, as described in our Cookie Notice. We, our service providers, and our business partners use these cookies and other similar technologies to collect and analyze certain kinds of technical information, including: IP address; the type of computer or mobile device you are using; platform type (like Apple iOS or Android); your operating system version; your mobile device’s identifiers, like your MAC Address, Apple Identifier For Advertising (IDFA), and/or Android Advertising ID (AAID); application performance and de-bugging information; your browser type and language; referring and exit pages, and URLs; the number of clicks on an app feature or web page; the amount of time spent on an app feature or web page; domain names; landing pages; pages viewed and the order of those pages; and/or game state and the date and time of activity on our Services. In some cases, we will connect the above information with your social network ID or RPS Game username.
                        <br/><br/>
                        <h5>Log Data</h5>
                        Like many site operators, we collect information that your browser sends whenever you visit our Site ("Log Data"). This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Site that you visit, the time and date of your visit, the time spent on those pages and other statistics. In addition, we may use third party services such as Google Analytics that collect, monitor and analyze this … The Log Data section is for businesses that use analytics or tracking services in websites or apps, like Google Analytics.
                        <br/><br/>
                        <h5>Cookies</h5>
                        Cookies are files with small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a web site and stored on your computer's hard drive. Like many sites, we use "cookies" to collect information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Site.
                        <br/><br/>
                        <h5>Security</h5>
                        The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
                        <br/><br/>
                        <h5>Changes To This Privacy Policy</h5>
                        This Privacy Policy is effective as of 22nd August 2022 and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page. We reserve the right to update or change our Privacy Policy at any time and you should check this Privacy Policy periodically. Your continued use of the Service after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy. If we make any material changes to this Privacy Policy, we will notify you either through the email address you have provided us, or by placing a prominent notice on our website.
                        <br/><br/>
                        <h5>Contact Us</h5>
                        If you have any questions about this Privacy Policy, please contact support@rps.game.
                        <br/><br/>
                        <h5>For All Enquiries</h5>
                        <p>For any technical/general problems, please contact <u style={{color: "#f5b22d"}}>support@rps.game</u>. We thank you for playing!</p>
                    </div>
                </div>
            </div>
        </Modal>;
    }
}

export default PrivacyModal;
