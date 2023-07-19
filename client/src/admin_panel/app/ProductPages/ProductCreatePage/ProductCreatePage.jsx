import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUrl } from '../../../../redux/Auth/user.actions';
import ContainerHeader from '../../../../components/ContainerHeader';
import { createItem, getItem, updateItem, deleteItem, setCurrentProductInfo} from '../../../../redux/Item/item.action';
import CreateProductForm from './CreateProductForm';
import { warningMsgBar, infoMsgBar } from '../../../../redux/Notification/notification.actions';
import history from '../../../../redux/history';

class ProductCreatePage extends Component {
  state = {
    _id: '',
    productName: '',
    price: '',
    image: '',
    startDateTime: new Date(),
    expireDateTime: new Date(),
    buttonDisable: true,
  };

  static getDerivedStateFromProps(props, state) {
    return {
      _id: props._id,
      productName: props.productName,
      price: props.price,
      image: props.image,
      startDateTime: props.startDateTime,
      expireDateTime: props.expireDateTime,
    };
  }

  componentDidMount() {
    if (this.props.match.params._id && this.state._id !== this.props.match.params._id) {
      this.props.setCurrentProductInfo({ _id: this.props.match.params._id });
    }

    this.props.setUrl(this.props.match.path);
    this.props.getItem();
  }

  setOnDelete = () => {
    this.props.deleteItem(this.state._id);
    this.handelCancel();
  };

  handelCancel = () => {
    this.setState({
      buttonDisable: true,
    });
    history.push(`/admin/product/`);
  };

  onSubmitFrom = e => {
    e.preventDefault();
    console.log(this.state);
    this.props.infoMsgBar(`product bine crate`);
    this.props.createItem(this.state);
    this.handelCancel();
  };

  onSaveForm = e => {
    e.preventDefault();
    console.log(this.state);
    this.props.infoMsgBar(`product bine saved`);
    this.props.updateItem(this.state);
    this.handelCancel();
  };

  buttonChange = (productName, price) => {
    if (productName !== '' && productName.length >= 3) {
      if (price !== '' && price.length >= 1) {
        this.setState({ buttonDisable: false });
      } else {
        this.setState({ buttonDisable: true });
      }
    } else {
      this.setState({ buttonDisable: true });
    }
  };

  updateTextField = (name, value, length) => {
    if (value === '' || value.length <= length) {
      if (name === 'productName') {
        this.buttonChange(value, this.state.price);
      } else if (name === 'price') {
        this.buttonChange(this.state.productName, value);
      }

      this.props.setCurrentProductInfo({ [name]: value });
    } else {
      this.props.warningMsgBar(`Value length is biggest than ${length}`);
    }
  };

  handleChange = (name, value) => {
    this.props.setCurrentProductInfo({ [name]: value });
  };

  render() {
    return (
      <>
        <ContainerHeader
          title={this.state._id === '' ? 'New Post' : 'Edit Product'}
        />
        <CreateProductForm
          handelCancel={this.handelCancel}
          updateTextField={this.updateTextField}
          onSubmitFrom={this.onSubmitFrom}
          handleChange={this.handleChange}
          onSaveForm={this.onSaveForm}
          setOnDelete={this.setOnDelete}
          buttonDisable={this.state.buttonDisable}
        />
      </>
    );
  }
}

const mapStateToProps = state => ({
  _id: state.itemReducer._id,
  productName: state.itemReducer.productName,
  price: state.itemReducer.price,
  image: state.itemReducer.image,
  startDateTime: state.itemReducer.startDateTime,
  expireDateTime: state.itemReducer.expireDateTime
});

const mapDispatchToProps = {
  setUrl,
  warningMsgBar,
  infoMsgBar,
  createItem,
  getItem,
  updateItem,
  deleteItem,
  setCurrentProductInfo
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductCreatePage);
