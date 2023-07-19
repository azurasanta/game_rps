import React, { Component } from 'react';
// import ColorThief from 'color-thief';
export default class Avatar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      src: props.src,
      alt: props.alt,
      darkMode: props.darkMode,
      dominantColor: null,
      ...props
    };

    // this.colorThief = new ColorThief();
  }

  componentDidMount() {
    this.getColor();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.src !== prevProps.src) {
      this.getColor();
    }
  }

  getColor() {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = this.props.src;
  
    image.onload = () => {
      const dominantColor = '#fff'; //this.colorThief.getColor(image);

      this.setState({ dominantColor });
    };
  }
  static getDerivedStateFromProps(props, current_state) {
    if (
      current_state.src !== props.src ||
      current_state.alt !== props.alt ||
      current_state.darkMode !== props.darkMode
    ) {
      return {
        ...current_state,
        src: props.src,
        alt: props.alt,
        darkMode: props.darkMode
      };
    }
    return null;
  }

  render() {
    const { src, alt, darkMode, dominantColor, ...rest } = this.state;
    if (src === '') {
      if (darkMode) {
        return (
          <div
          {...rest}
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#2D2D2D'
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{ width: '100%', height: '100%' }}
            onError={e => {
              e.target.src = '/img/profile-thumbnail-dark.svg';
            }}
          />
          {dominantColor && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: `4px solid rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`,
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>
        );
      }
      return (
        <div
        {...rest}
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#2D2D2D'
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%' }}
          onError={e => {
            e.target.src = '/img/profile-thumbnail.svg';
          }}
        />
        {dominantColor && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: `4px solid rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`,
              boxSizing: 'border-box'
            }}
          />
        )}
      </div>
      );
    }


    if (darkMode) {
      return (
        <div
          {...rest}
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#2D2D2D'
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{ width: '100%', height: '100%' }}
            onError={e => {
              e.target.src = '/img/profile-thumbnail-dark.svg';
            }}
          />
          {dominantColor && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: `4px solid rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`,
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>
      );
    }
    return (
      <div
        {...rest}
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#F3F3F3'
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%' }}
          onError={e => {
            e.target.src = '/img/profile-thumbnail.svg';
          }}
        />
        {dominantColor && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: `4px solid rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`,
              boxSizing: 'border-box'
            }}
          />
        )}
      </div>
   

    );
  }
}
