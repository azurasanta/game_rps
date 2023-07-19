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

class TermsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showTermsModal: false
        }
    }

    handleOpenTermsModal = () => {
        this.setState({ showTermsModal: true });
    }

    componentDidMount() {
    }

    render() {
        return <Modal
            isOpen={this.props.modalIsOpen}
            onRequestClose={this.props.closeModal}
            style={customStyles}
            contentLabel="Terms Modal"
        >
            <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
					<div className='modal-header'>
                    <h2 className="modal-title">Terms <span style={{color: "#d81719"}}>RPS</span> <span style={{color: "#ebddca"}}>Game</span></h2>
					<Button className="btn-close" onClick={this.props.closeModal}>×</Button>
                    </div>
				<div className="modal-body edit-modal-body terms-modal-body">
                    <div>
                        <h2>Terms of Service</h2>
                        <br/>
                        <h5>Last Updated: 2nd March 2023</h5>
                        <br/>
                        <h5>Welcome to RPS GAME!</h5>
                        <br/>
                        These terms and conditions outline the rules and regulations for the use of RPS Game's site, located at rps.game. By accessing this site we assume you accept these terms and conditions. Do not continue to use RPS Game if you do not agree to take all of the terms and conditions stated on this page. The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this site and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services, in accordance with and subject to, prevailing law of the United Kingdom. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to same.<br/>
                        <br/>
                        <h5>1.0 General</h5>
                        <h5>1.1 Cookies</h5>
                        We employ the use of cookies. By accessing RPS Game, you agreed to use cookies in agreement with the RPS Game's Privacy Policy. Most interactive sites use cookies to let us retrieve the user’s details for each visit. Cookies are used by our site to enable the functionality of certain areas to make it easier for people visiting our site. Some of our affiliate/advertising partners may also use cookies.<br/>
                        <br/>
                        <h5>1.2 License</h5>
                        Unless otherwise stated, RPS Game and/or its licensors own the intellectual property rights for all material on RPS Game. All intellectual property rights are reserved. You may access this from RPS Game for your own personal use subjected to restrictions set in these terms and conditions.<br/>
                        <br/>
                        You must not:<br/>
                        <br/>
                        Republish material from RPS Game<br/>
                        Sell, rent or sub-license material from RPS Game<br/>
                        Reproduce, duplicate or copy material from RPS Game<br/>
                        Redistribute content from RPS Game<br/>
                        This Agreement shall begin on the date hereof.<br/>
                        <br/>
                        <h5>1.3 Hyperlinking to our Content</h5>
                        The following organizations may link to our site without prior written approval:<br/>
                        <br/>
                        Government agencies;<br/>
                        Search engines;<br/>
                        News organizations;<br/>
                        Online directory distributors may link to our site in the same manner as they hyperlink to the sites of other listed businesses; and<br/>
                        System wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our site.<br/>
                        These organizations may link to our home page, to publications or to other site information so long as the link: (a)is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services; and (c) fits within the context of the linking party’s site.<br/>
                        We may consider and approve other link requests from the following types of organizations:<br/>
                        <br/>
                        commonly-known consumer and/or business information sources;<br/>
                        dot.com community sites;<br/>
                        associations or other groups representing charities;<br/>
                        online directory distributors;<br/>
                        internet portals;<br/>
                        accounting, law and consulting firms; and<br/>
                        educational institutions and trade associations.<br/>
                        We will approve link requests from these organizations if we decide that: (a) the link would not make us look unfavorably to ourselves or to our accredited businesses; (b) the organization does not have any negative records with us; (c) the benefit to us from the visibility of the hyperlink compensates the absence of RPS Game; and (d) the link is in the context of general resource information.<br/>
                        These organizations may link to our home page so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products or services; and (c) fits within the context of the linking party’s site.<br/>
                        If you are one of the organizations listed in paragraph 2 above and are interested in linking to our site, you must inform us by sending an e-mail to support@rps.game. Please include your name, your organization name, contact information as well as the URL of your site, a list of any URLs from which you intend to link to our site, and a list of the URLs on our site to which you would like to link. Wait 2-3 days for a response.<br/>
                        Approved organizations may hyperlink to our site as follows:<br/>
                        <br/>
                        By use of our corporate name; or<br/>
                        By use of the uniform resource locator being linked to; or<br/>
                        By use of any other description of our site being linked to that makes sense within the context and format of content on the linking party’s site.<br/>
                        <br/>
                        <h5>1.4 iFrames</h5>
                        Without prior approval and written permission, you may not create frames around our Web pages that alter in any way the visual presentation or appearance of our site.<br/>
                        <br/>
                        <h5>1.5 Content Liability</h5>
                        We shall not be held responsible for any content that appears on your site. You agree to protect and defend us against all claims that is rising on your site. No link(s) should appear on any site that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.<br/>
                        <br/>
                        <h5>1.6 Your Privacy</h5>
                        Please read our Privacy Policy.<br/>
                        <br/>
                        <h5>1.7 Reservation of Rights</h5>
                        We reserve the right to request that you remove all links or any particular link to our site. You approve to immediately remove all links to our site upon request. We also reserve the right to amend these terms and conditions and it’s linking policy at any time. By continuously linking to our site, you agree to be bound to and follow these linking terms and conditions.<br/>
                        <br/>
                        <h5>1.8 Removal of links from our site</h5>
                        If you find any link on our site that is offensive for any reason, you are free to contact and inform us any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly. We do not ensure that the information on this site is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that the site remains available or that the material on the site is kept up to date.<br/>
                        <br/>
                        <h5>1.9 Disclaimer</h5>
                        To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our site and the use of this site. Nothing in this disclaimer will:<br/>
                        <br/>
                        limit or exclude our or your liability for death or personal injury;<br/>
                        limit or exclude our or your liability for fraud or fraudulent misrepresentation;<br/>
                        limit any of our or your liabilities in any way that is not permitted under applicable law; or<br/>
                        exclude any of our or your liabilities that may not be excluded under applicable law.<br/>
                        The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.<br/>
                        As long as the site and the information and services on the site are provided free of charge, we will not be liable for any loss or damage of any nature.<br/>
                        <br/>
                        <h5>2.0 Your Dealings With Other Players</h5>
                        You are responsible for your interactions with other players. If you have a problem with another player, we are not required to get involved, but we can if we desire.<br/>
                        If you have a dispute with another player, you release RPS Game, the RPS Game Corporate Family, and all RPS Game Affiliates from responsibility, claims, demands, and/or damages (actual or consequential) of every kind and nature, whether known or unknown, resulting from that dispute or connected to that dispute. This includes damages for loss of profits, goodwill, use, or data. This does not apply to users located in the EEA. If you are located in the EEA, your liability vis-à-vis RPS Game is as set forth by the law applicable in the country where you reside.<br/>
                        <br/>
                        <h5>3.0 Payment Terms</h5>
                        We provide a service in the form of holding payments between peers within a game of ‘Rock’ - ‘Paper’ - ‘Scissors’. In the Services you may use “real world” money to obtain a limited license and right to use Virtual Bets and/or other goods or services.<br/>
                        <br/>
                        <h5>3.1 How it Works</h5>
                        You get a limited license and right to use Virtual Bets after visiting the payment gateway in one of our games or Services and providing billing authorization through the gateway on which relates to the game you are playing.<br/>
                        When you make a purchase on RPS Game, the payment gateway will let you know what payment methods you can use to pay when you make your purchase. The price of the product will be the price indicated on the order page when you place your order. When your purchase is complete, we may send you a confirmation email that will have details of the items you have ordered. Please check that the details in the confirmation message are correct as soon as possible and keep a copy of it for your records. RPS Game may keep records of RPS Game transactions in order to handle any future questions about that transaction.<br/>
                        You can contact our Online Support team (support@rps.game) for questions concerning refunds of purchases.<br/>
                        For Virtual Bets, your order will represent an offer to us to obtain a limited license and right to use the relevant Service(s) or Virtual Bet(s) that will be accepted by us when we accept payment. At that point, the limited license begins.<br/>
                        For orders to obtain a limited license and right to use Virtual Bets, by clicking the purchase/order button on the purchase window or page you:<br/>
                        <br/>
                        agree that we will supply the Virtual Bets to you as soon as we have accepted your order; and<br/>
                        if you reside in the European Union (the “EU”), you acknowledge that you will therefore no longer have the right to cancel under the EU’s Consumer Rights Directive (as implemented by the law of the country where you are located) once we start to supply the Virtual Item.<br/>
                        <br/>
                        You understand that while you may “earn,” “buy,” or “purchase” Virtual Bets in our Services, you do not legally “own” the Virtual Bets and the amounts of any Virtual Bet do not refer to any credit balance of real currency or its equivalent. Any “virtual currency” balance shown in your Account does not constitute a real-world balance or reflect any stored value, but instead constitutes a measurement of the extent of your limited license. ALL SALES ARE FINAL:<br/>
                        YOU ACKNOWLEDGE THAT RPS Game IS NOT REQUIRED TO PROVIDE A REFUND FOR ANY REASON, AND THAT YOU WILL NOT RECEIVE MONEY OR OTHER COMPENSATION FOR UNUSED VIRTUAL BETS WHEN AN ACCOUNT IS CLOSED, WHETHER SUCH CLOSURE WAS VOLUNTARY OR INVOLUNTARY, OR WHETHER YOU MADE A PAYMENT THROUGH RPS Game WHERE WE OFFER OUR SERVICES.<br/>
                        PURCHASES TO ACQUIRE A LIMITED LICENSE AND RIGHT TO USE VIRTUAL BETS ARE NON-REFUNDABLE TO THE FULLEST EXTENT ALLOWED BY LAW.<br/>
                        <br/>
                        <h5>3.2 Additional Payment Terms</h5>
                        You agree to pay all fees and applicable taxes incurred by you or anyone using an Account registered to you. RPS Game may revise the pricing for the goods and services it licenses to you through the Services at any time.<br/>
                        <br/>
                        <h5>3.3 Billing Support</h5>
                        For billing support, please contact us through support@rps.game in which you will receive a response within 2 working days. Please note that e-mail support for billing-related issues and questions is available in English only.<br/>
                        <br/>
                        <h5>4.0 Promotions and Offers</h5>
                        From time to time, we may offer limited-time promotions. In addition, from time to time, we may promote Offers. We are not required to give, and you are not required to accept, any Offer. Offers are not transferable, redeemable, or exchangeable for other things of value, except at our sole discretion. If you accept any Offer, you may have to sign a declaration of eligibility and liability release or other paperwork to receive the Offer. Some Offers will be subject to taxes and other charges, travel, or activities outside of the virtual world, all of which will be disclosed before you accept the offer. If you accept any Offer, you assume all liability associated with the Offer.<br/>
                        <br/>
                        <h5>5.0 Copyright Notices/Complaints</h5>
                        We respect the intellectual property rights of others and ask that you do, as well. We respond to notices of alleged copyright infringement that comply with the US Digital Millennium Copyright Act (“DMCA”), the E-Commerce Directive and associated legislation in the EU, and similar or equivalent other local laws that may apply. We reserve the right to terminate any player’s access to the Services if we determine that the player is a “repeat infringer.” We do not have to notify the player before we do this.<br/>
                        <br/>
                        <h5>6.0 Feedback and Unsolicited Ideas</h5>
                        We may request your feedback on certain features through a promotion or our customer insights program. You are not obliged to respond to our request. Any feedback you provide at our request through a promotion or program is subject to the rules of the specific promotion or program. With any idea, information, or feedback you submit to us voluntarily, you agree that:<br/>
                        <br/>
                        RPB Bet will consider the Submissions to be non-confidential and non-proprietary.<br/>
                        RPB Bet shall have no obligations concerning the Submissions, including but not limited to, no obligation to return any materials or acknowledge receipt of any Submissions.<br/>
                        RPB Bet may use, redistribute, or disclose the Submissions for any purpose and in any way, without any compensation to you or any third party.<br/>
                        <br/>
                        <h5>7.0 Availability of the Services; Warranty Disclaimer</h5>
                        RPS Game, the RPS Game Corporate Family, and the RPS Game Affiliates make no promises or guarantees that the Services or any content on them will always be available, uninterrupted, or error-free. We may suspend, withdraw, or restrict the availability of all or any part of our Services for business and operational reasons.<br/>
                        USE OF THE SERVICES IS AT YOUR SOLE RISK. THEY ARE PROVIDED ON AN “AS IS” BASIS. TO THE EXTENT PERMITTED BY APPLICABLE LAW, RPS Game, THE RPS Game CORPORATE FAMILY, AND THE RPS Game AFFILIATES MAKE NO WARRANTIES, CONDITIONS, OR OTHER TERMS OF ANY KIND, EITHER EXPRESS OR IMPLIED, ABOUT THE SERVICES. RPS Game, THE RPS Game CORPORATE FAMILY, AND THE RPS Game AFFILIATES DISCLAIM ANY WARRANTIES OF TITLE OR IMPLIED WARRANTIES, CONDITIONS, OR OTHER TERMS OF NON-INFRINGEMENT, MERCHANTABILITY, QUIET ENJOYMENT, OR FITNESS FOR A PARTICULAR PURPOSE.<br/>
                        If your state or country does not allow these disclaimers, they do not apply to you. If your state or country requires a certain period for which a warranty applies, it will be either the shorter of 30 days from your first use of the Services or the shortest period required by law.<br/>
                        <br/>
                        <h5>8.0 Limitations; Waiver of Liability</h5>
                        YOU ACKNOWLEDGE THAT RPS Game, THE RPS Game CORPORATE FAMILY, AND THE RPS Game AFFILIATES ARE NOT LIABLE<br/>
                        (1) FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES, INCLUDING FOR LOSS OF PROFITS, GOODWILL, OR DATA, IN ANY WAY WHATSOEVER ARISING OUT OF THE USE OF, OR INABILITY TO USE, THE SERVICES; OR (2) FOR THE CONDUCT OF THIRD PARTIES, INCLUDING OTHER USERS OF THE SERVICES AND OPERATORS OF EXTERNAL SITES. THE RISK OF USING THE SERVICES AND EXTERNAL SITES RESTS ENTIRELY WITH YOU AS DOES THE RISK OF INJURY FROM THE SERVICES AND EXTERNAL SITES. TO THE FULLEST EXTENT ALLOWED BY ANY LAW THAT APPLIES, THE DISCLAIMERS OF LIABILITY IN THESE TERMS APPLY TO ALL DAMAGES OR INJURY CAUSED BY THE SERVICES, OR RELATED TO USE OF, OR INABILITY TO USE, THE SERVICES, UNDER ANY CAUSE OF ACTION IN ANY JURISDICTION, INCLUDING, WITHOUT LIMITATION, ACTIONS FOR BREACH OF WARRANTY, BREACH OF CONTRACT, OR TORT (INCLUDING NEGLIGENCE). TO THE MAXIMUM EXTENT PERMISSIBLE UNDER APPLICABLE LAWS, THE TOTAL LIABILITY OF RPS Game, THE RPS Game CORPORATE FAMILY, AND/OR THE RPS Game AFFILIATES IS LIMITED TO THE TOTAL AMOUNT YOU HAVE PAID RPS Game, THE RPS Game CORPORATE FAMILY, AND/OR THE RPS Game AFFILIATE IN THE ONE HUNDRED AND EIGHTY DAYS (180) DAYS IMMEDIATELY PRECEDING THE DATE ON WHICH YOU FIRST ASSERT ANY SUCH CLAIM. IF YOU HAVE NOT PAID RPS Game, THE RPS Game CORPORATE FAMILY, OR ANY RPS Game AFFILIATE ANY AMOUNT IN THE ONE HUNDRED AND EIGHTY DAYS (180) DAYS IMMEDIATELY PRECEDING THE DATE ON WHICH YOU FIRST ASSERT ANY SUCH CLAIM, YOUR SOLE AND EXCLUSIVE REMEDY FOR ANY DISPUTE WITH RPS Game, THE RPS Game CORPORATE FAMILY, AND/OR ANY RPS Game AFFILIATE IS TO STOP USING THE SERVICES AND TO CANCEL YOUR ACCOUNT.<br/>
                        Some states or countries do not allow the exclusion of certain warranties or the limitations/exclusions of liability described above, which means these limitations/exclusions may not apply to you if you reside in one of those states or countries.<br/>
                        These limitations/exclusions to do not apply to users located in the EEA. For those users, if RPS Game fails to comply with these Terms, RPS Game is responsible for loss or damage you suffer that is a foreseeable result of RPS Game’s breach of these Terms or is a result of RPS Game’s negligence, but RPS Game is not responsible for any loss or damage that is not foreseeable. Loss or damage is foreseeable if it was an obvious consequence of our breach or if it was contemplated by you and RPS Game at the time we entered into these Terms.<br/>
                        <br/>
                        <h5>9.0 Bots/Artificial Intelligence</h5>
                        RPS Game is to be completely bot-free and purely human vs. human. The below terms will apply whether any software or bot activity is or has been used in conjunction with the games client.<br/>
                        RPS Game prohibits the use any use of bot software or artificial intelligence by players, whether commercially obtained or privately developed.<br/>
                        RPS Game will actively monitor and look for such software on a player’s device, by registering the player consents to such software being searched for, and will not interfere with any of the detection mechanisms.<br/>
                        <br/>
                        <h5>10.0 One Account per Player</h5>
                        Players may open only one account with RPS Game. Players must not attempt to bypass any of the restrictions which prevent the creation and/or use of multiple accounts.<br/>
                        <br/>
                        <h5>11.0 Account Sharing</h5>
                        Players must not share their account with any other person, nor share their account information (password etc.). Players may not allow any other person to use their account, nor use any account other than their own.<br/>
                        <br/>
                        <h5>12.0 'RPS Farming'</h5>
                        Players must play exclusively on their own behalf, in their own best interests. RPS Game prohibits playing on behalf of an employer or any form of team/co-operative.<br/>
                        <br/>
                        <h5>13.0 Angleshooting</h5>
                        RPS Game prohibits activities designed to give a player an unfair advantage even if such play is allowed within a strict interpretation of - or a loophole in - the rules. Any play considered conventionally unethical or unfair is prohibited.<br/>
                        <br/>
                        <h5>14.0 Problem Gamblers</h5>
                        Anyone with a gambling problem must not open an account with, or play on, RPS Game. Should a player discover they have a gambling problem they should inform RPS Game and cease playing immediately.<br/>
                        <br/>
                        <h5>15.0 Locked/Closed Accounts</h5>
                        RPS Game can, at their discretion, lock and/or permanently close a player’s account and without prior notice.<br/>
                        <br/>
                        <h5>16.0 Player Funds</h5>
                        Should a player be found in violation of the casino rules or RPS Game’s Terms & Conditions, we reserve the right to seize all of the funds in the player’s account (and to reverse any pending withdrawals).<br/>
                        <br/>
                        <h5>17.0 Complaints and Disputes</h5>
                        We are committed to providing a high standard of service to our players and our Internal Complaints Procedure is designed to resolve problems and difficulties quickly and easily.<br/>
                        <br/>
                        For all Enquiries: support@rps.game<br/>
                        <br/>
                        <h5>Contact Us</h5>
                        If you have any questions about this Terms Policy, please contact support@rps.game.<br/>
                    </div>

                    <h5 className="mt-3">For All Enquiries</h5>
                    <p>For any technical/general problems, please contact <u style={{color: "#f5b22d"}}>support@rps.game</u>. We thank you for playing!</p>
                </div>
            </div>
        </Modal>;
    }
}

export default TermsModal;
